package IDGenerator

import (
	ISender2 "Server_gozero/common/ISender/ISender"
	"context"
	"errors"
	"fmt"
	"math/rand"
	"sync"
	"sync/atomic"
	"time"

	"github.com/zeromicro/go-zero/core/logx"
)

// idBuffer 存储ID号码段信息
// 使用指针确保并发操作作用于同一内存地址
type idBuffer struct {
	startId atomic.Int64 // 原子操作的起始ID
	maxId   int64        // 该ID段的最大值（闭区间），只读属性无需原子操作
}

// Ident 分布式ID服务
type Ident struct {
	idRpcClient    ISender2.IDClient // id主节点的rpc客户端
	pools          sync.Map          // 业务标签池映射 (key: bizTag, value: *idPool)
	preloadBizTags []string          // 预加载的业务标签列表
}

// idPool 每个业务标签独立的ID池
// 实现乒乓双缓冲机制：当前段耗尽时立即切换到预备段
type idPool struct {
	current  atomic.Value   // 当前缓冲区，存储当前使用的*idBuffer（指针确保原子操作有效）
	prepare  chan *idBuffer // 预备缓冲区，带缓冲的预备段管道(容量1)
	fetching sync.Mutex     // 防止重复获取的互斥锁（保证段切换的原子性）
}

const (
	maxRetry          = 5                      // 最大重试次数（指数退避）
	baseRetryTime     = 100 * time.Millisecond // 基础重试时间
	asyncFetchTimeout = 3 * time.Second        // 异步获取ID段的超时时间
)

// 预加载的业务标签列表
var preloadBizTags = []string{
	"user",
}

// NewIdent 初始化ID服务
// ctx: 上下文用于控制初始化生命周期
// idRpcClient: id主节点的rpc客户端
func NewIdent(ctx context.Context, idRpcClient ISender2.IDClient) (*Ident, error) {
	ident := &Ident{
		idRpcClient:    idRpcClient,
		preloadBizTags: preloadBizTags,
	}

	// 使用错误组并行初始化预加载标签
	var wg sync.WaitGroup
	errChan := make(chan error, len(ident.preloadBizTags))

	for _, tag := range ident.preloadBizTags {
		wg.Add(1)
		go func(tag string) {
			defer wg.Done()
			// 创建新的ID池实例
			pool := newIdPool()

			// 尝试加载当前业务标签ID池，当键不存在时，存储pool值，返回传入的 pool。
			actual, _ := ident.pools.LoadOrStore(tag, pool)

			// 类型断言安全检查
			p, ok := actual.(*idPool)
			if !ok {
				errChan <- fmt.Errorf("池类型不匹配, bizTag=%s", tag)
				return
			}

			//  从主节点获取ID号码段，带指数退避的重试机制
			buf, err := ident.retryFetch(ctx, tag, true)
			if err != nil {
				errChan <- fmt.Errorf("初始化标签[%s]失败: %w", tag, err)
				return
			}
			// 将ID号码段信息存储到 map 中
			p.current.Store(buf)
		}(tag)
	}

	wg.Wait()
	close(errChan)

	// 收集初始化错误
	if len(errChan) > 0 {
		var errs []error
		for err := range errChan {
			errs = append(errs, err)
		}
		return nil, fmt.Errorf("初始化失败: %v", errors.Join(errs...))
	}

	return ident, nil
}

// newIdPool 创建新的ID池实例
func newIdPool() *idPool {
	pool := &idPool{
		prepare: make(chan *idBuffer, 1), // 缓冲为1避免阻塞
	}

	// 初始化一个无效段（maxId=-1强制首次使用时获取新段）
	pool.current.Store(&idBuffer{
		maxId: -1, // 设置为无效值
	})
	return pool
}

// 获取分布式ID (线程安全)
func (l *Ident) GetId(ctx context.Context, in *ISender2.GetIDReq) (int64, error) {
	// 根据业务标签获取或创建ID池
	poolVal, ok := l.pools.Load(in.BizTag)
	if !ok {
		// 动态创建新业务标签的池
		newPool := newIdPool()
		poolVal, _ = l.pools.LoadOrStore(in.BizTag, newPool)
	}

	// 类型断言安全检查
	pool, ok := poolVal.(*idPool)
	if !ok {
		logx.Errorf("严重错误: 池类型不匹配, bizTag=%s", in.BizTag)
		return -1, errors.New("internal server error")
	}

	// 主循环：尝试获取ID直到成功或出错
	for {
		select {
		case <-ctx.Done(): // 检查上下文取消
			return -1, ctx.Err()
		default:
			// 原子加载当前buffer指针
			curBuf := pool.current.Load().(*idBuffer)
			curStart := curBuf.startId.Load() // 原子读取当前起始位置

			// 当前段有可用ID
			if curStart <= curBuf.maxId {
				// 原子递增获取ID（硬件支持的原子操作，用于实现无锁的并发控制，原子Add(1)是实现无锁并发分配的最高效方式）
				newStart := curBuf.startId.Add(1)
				id := newStart - 1

				// 双重校验：确认获取后仍在段范围内
				if id < curBuf.maxId {
					return id, nil
				}
				// 原子操作后超出范围，进入段切换流程
			}

			// 获取段切换锁（防止多个goroutine同时触发段获取）
			pool.fetching.Lock()

			// 双重检查：重新加载最新状态
			curBuf = pool.current.Load().(*idBuffer)
			curStart = curBuf.startId.Load()
			if curStart <= curBuf.maxId {
				// 其他goroutine已完成段切换，直接解锁并重试
				pool.fetching.Unlock()
				continue
			}

			// 优先尝试使用预备缓冲区（无阻塞检查）
			select {
			case nextBuf := <-pool.prepare: // 从预备管道读取缓冲段
				// 成功获取预备段，更新为当前段
				pool.current.Store(nextBuf)
				// 异步填充下一个预备段
				go l.fillPrepareAsync(pool, in.BizTag)
			default:
				// 无预备号码段时同步从主节点获取ID号码段，带指数退避的重试机制
				newBuf, err := l.retryFetch(ctx, in.BizTag, false)
				if err != nil {
					pool.fetching.Unlock()
					// 尝试恢复：后台异步获取新段避免完全阻塞
					go l.fillPrepareAsync(pool, in.BizTag)
					return -1, fmt.Errorf("同步获取ID段失败: %w", err)
				}
				// 更新当前段
				pool.current.Store(newBuf)
				// 异步预加载下一段
				go l.fillPrepareAsync(pool, in.BizTag)
			}

			// 释放段切换锁
			pool.fetching.Unlock()
		}
	}
}

// 从主节点获取ID号码段，带指数退避的重试机制
func (l *Ident) retryFetch(ctx context.Context, tag string, isInit bool) (*idBuffer, error) {
	// 指数退避重试循环
	for i := 0; i < maxRetry; i++ {

		//从主节点获取ID号码段
		buf, err := l.fetchIdSegment(ctx, tag)
		if err == nil {
			return buf, nil // 成功返回
		}

		// 初始化阶段直接向上传播错误
		if isInit {
			return nil, err
		}

		// 指数退避计算：2^i * baseRetryTime
		waitTime := time.Duration(1<<uint(i)) * baseRetryTime

		// 添加随机抖动（避免惊群效应）
		jitter := time.Duration(rand.Int63n(int64(waitTime / 2)))

		// 等待或退出
		select {
		case <-ctx.Done(): // 上下文取消
			return nil, ctx.Err()
		case <-time.After(waitTime + jitter): // 等待下次重试
		}
	}

	// 超过最大重试次数
	return nil, fmt.Errorf("获取[%s]号码段超过最大重试次数", tag)
}

// fillPrepareAsync 异步填充预备缓冲区
func (l *Ident) fillPrepareAsync(pool *idPool, bizTag string) {
	// 创建独立上下文控制超时
	ctx, cancel := context.WithTimeout(context.Background(), asyncFetchTimeout)
	defer cancel()

	// 尝试获取段锁（非阻塞防止重复填充）
	if !pool.fetching.TryLock() {
		return // 其他goroutine正在操作
	}
	defer pool.fetching.Unlock()

	// 检查是否已有预备段（避免重复工作）
	if len(pool.prepare) == cap(pool.prepare) {
		return
	}

	// 从主节点获取新ID段
	buf, err := l.fetchIdSegment(ctx, bizTag)
	if err != nil {
		logx.Errorf("异步填充[%s]预备段失败: %v", bizTag, err)
		return
	}

	// 非阻塞方式放入预备管道
	select {
	case pool.prepare <- buf: // 成功放入预备段
	default: // 预备段已满时跳过
	}
}

// fetchIdSegment 从主节点获取ID号码段
func (l *Ident) fetchIdSegment(ctx context.Context, bizTag string) (*idBuffer, error) {
	// 调用主节点RPC接口
	reply, err := l.idRpcClient.GetID(ctx, &ISender2.GetIDReq{
		BizTag: bizTag,
	})
	if err != nil {
		return nil, err
	}

	// 构造ID段（闭区间[StartId, EndId]）
	buf := &idBuffer{
		maxId: reply.IdEnd, // 段结束ID
	}
	buf.startId.Store(reply.IdStart) // 原子存储起始ID
	return buf, nil
}
