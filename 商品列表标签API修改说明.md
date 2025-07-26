# 商品列表标签API修改说明

## 修改概述
在 `goodsApi.js` 中新增了根据标签获取商品的API函数，并修改了商品列表页面的逻辑，将原来根据分组ID获取数据的方式改为使用标签获取数据。

## 修改的文件

### 1. 商品API服务
**文件：** `Client/model/goodsApi.js`

#### 新增函数：
```javascript
/**
 * 根据标签获取商品列表
 * @param {string} goodTag - 商品标签
 * @param {number} userId - 用户ID
 * @returns {Promise<Goods[]>} 商品列表
 */
export function getGoodsByTag(goodTag, userId = 0) {
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const tokenData = wx.getStorageSync('token');
    let headers = {
      'Content-Type': 'application/json'
    };

    // 如果有token，添加到请求头
    if (tokenData && tokenData.accessToken) {
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    }

    wx.request({
      url: 'http://localhost:8889/api/getGoodsByTag',
      method: 'POST',
      data: {
        user_id: userId,
        good_tag: goodTag
      },
      header: headers,
      timeout: 10000,
      success: (res) => {
        console.log('根据标签获取商品列表成功:', res);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response = res.data;
          if (response.code === 200) {
            // 如果 image_urls 是字符串，尝试解析为数组
            const goodsList = response.goods_list.map(good => ({
              ...good,
              image_urls: parseImageUrls(good.image_urls)
            }));
            
            resolve(goodsList);
          } else {
            reject(new Error(response.msg || '根据标签获取商品列表失败'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
        }
      },
      fail: (err) => {
        console.error('根据标签获取商品列表失败:', err);
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
}
```

### 2. 商品列表页面
**文件：** `Client/pages/goods/list/index.js`

#### 修改内容：

- **导入新的API函数** (第1行)：
  ```javascript
  import { getGoodsByTag } from '../../../model/goodsApi';
  ```

- **修改初始化逻辑** (第151-242行)：
  ```javascript
  async init(reset = true) {
    const { loadMoreStatus, goodsList = [], sorts, overall, minVal, maxVal, groupId } = this.data;
    
    if (reset) {
      if (loadMoreStatus !== 0) return;
      this.setData({ loadMoreStatus: 1, loading: true });
      
      try {
        console.log('[init] 开始根据标签获取商品列表, groupId:', groupId);
        
        // 使用 groupId 作为标签来获取商品
        const goodsList = await getGoodsByTag(groupId, 0);
        
        if (Array.isArray(goodsList)) {
          const totalCount = goodsList.length;
          
          if (totalCount === 0) {
            this.total = totalCount;
            this.setData({
              emptyInfo: {
                tip: '抱歉，未找到相关商品',
              },
              hasLoaded: true,
              loadMoreStatus: 0,
              loading: false,
              goodsList: [],
            });
            return;
          }

          // 转换数据格式以适配前端显示
          const spuList = goodsList.map(item => ({
            good_id: item.good_id,
            thumb: item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : '',
            title: item.title,
            price: item.price,
            originPrice: item.price,
            desc: item.detail || '',
            tags: item.good_tag ? [item.good_tag] : [],
            // 保留原始数据
            ...item
          }));

          this.originalGoodsList = spuList;
          
          // 先按价格筛选
          const filteredList = this.filterGoodsByPrice(spuList, minVal, maxVal);
          
          // 再按排序条件排序
          const sortedList = this.sortGoodsList(filteredList, sorts, overall);
          
          this.pageNum = 1;
          this.total = totalCount;
          this.setData({
            goodsList: sortedList,
            loadMoreStatus: sortedList.length === totalCount ? 2 : 0,
            loading: false,
            hasLoaded: true
          });
        } else {
          this.setData({
            loading: false,
          });
          wx.showToast({
            title: '查询失败，请稍候重试',
          });
        }
      } catch (error) {
        console.error('[init] 获取商品列表失败:', error);
        this.setData({ loading: false, hasLoaded: true });
        wx.showToast({
          title: '获取商品列表失败',
          icon: 'none'
        });
      }
    } else {
      // 先按价格筛选
      const filteredList = this.filterGoodsByPrice(this.originalGoodsList, minVal, maxVal);
      
      // 再按排序条件排序
      const sortedList = this.sortGoodsList(filteredList, sorts, overall);
      
      this.setData({
        goodsList: sortedList,
        loading: false
      });
    }
  },
  ```

- **修改页面加载逻辑** (第243-256行)：
  ```javascript
  onLoad(options) {
    const { groupId = '', tag = '' } = options;
    // 优先使用 tag 参数，如果没有则使用 groupId
    const goodTag = tag || groupId || '';
    console.log('[onLoad] 加载商品列表页面, 标签:', goodTag);
    
    this.setData({ groupId: goodTag }, () => {
      this.init(true);
    });

    // 使用节流包装handleFilterChange
    this.throttledFilterChange = throttle(this.handleFilterChange.bind(this), 300);
  },
  ```

## API接口说明

### 请求参数
```javascript
{
  user_id: number,    // 用户ID
  good_tag: string    // 商品标签
}
```

### 响应数据
```javascript
{
  code: number,       // 状态码
  msg: string,        // 响应信息
  goods_list: Goods[] // 商品列表
}
```

### 商品数据结构
```javascript
{
  id: number,         // 主键ID
  del_state: number,  // 0-正常 1-删除
  del_time: string,   // 删除时间
  create_time: string, // 创建时间
  good_id: number,    // 分布式唯一ID
  title: string,      // 商品名称
  good_tag: string,   // 商品标签
  farm_id: number,    // 所属农场ID
  image_urls: string, // 图片信息
  price: number,      // 价格
  units: string,      // 单位
  repertory: number,  // 库存
  detail: string      // 商品详情
}
```

## 核心逻辑

### 数据流向：
1. **页面参数** → `groupId` 或 `tag` 参数
2. **API调用** → `getGoodsByTag(groupId, userId)`
3. **数据转换** → 将API返回的数据转换为前端显示格式
4. **筛选排序** → 应用价格筛选和排序逻辑
5. **页面渲染** → 显示商品列表

### 兼容性处理：
- 支持 `groupId` 和 `tag` 两种参数名称
- 优先使用 `tag` 参数，如果没有则使用 `groupId`
- 保留原有的筛选和排序功能
- 保持原有的错误处理和加载状态

## 功能特点

1. **标签筛选**：根据商品标签获取相关商品
2. **数据转换**：自动转换API数据格式适配前端显示
3. **错误处理**：完善的错误处理和用户提示
4. **加载状态**：保持原有的加载状态管理
5. **筛选排序**：保留价格筛选和排序功能

## 使用方式

### 页面跳转：
```javascript
// 使用 groupId 参数
wx.navigateTo({
  url: `/pages/goods/list/index?groupId=水果`
});

// 使用 tag 参数
wx.navigateTo({
  url: `/pages/goods/list/index?tag=蔬菜`
});
```

### API调用：
```javascript
// 直接调用API
const goods = await getGoodsByTag('水果', 0);
```

## 测试建议

1. **标签参数**：测试不同的标签值
2. **空标签**：测试空标签或无效标签的情况
3. **网络错误**：测试网络请求失败的情况
4. **数据格式**：验证数据转换的正确性
5. **筛选排序**：确认筛选和排序功能正常工作 