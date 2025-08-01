// Code generated by goctl. DO NOT EDIT.
// versions:
//  goctl version: 1.8.4

package model

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/builder"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/core/stringx"
)

var (
	idSenderFieldNames          = builder.RawFieldNames(&IdSender{})
	idSenderRows                = strings.Join(idSenderFieldNames, ",")
	idSenderRowsExpectAutoSet   = strings.Join(stringx.Remove(idSenderFieldNames, "`id`", "`create_at`", "`create_time`", "`created_at`", "`update_at`", "`update_time`", "`updated_at`"), ",")
	idSenderRowsWithPlaceHolder = strings.Join(stringx.Remove(idSenderFieldNames, "`id`", "`create_at`", "`create_time`", "`created_at`", "`update_at`", "`update_time`", "`updated_at`"), "=?,") + "=?"
)

type (
	idSenderModel interface {
		Insert(ctx context.Context, data *IdSender) (sql.Result, error)
		FindOne(ctx context.Context, id int64) (*IdSender, error)
		FindOneByBizTag(ctx context.Context, bizTag string) (*IdSender, error)
		Update(ctx context.Context, bizTag string) error
		Delete(ctx context.Context, id int64) error
	}

	defaultIdSenderModel struct {
		conn  sqlx.SqlConn
		table string
	}

	IdSender struct {
		Id         int64     `db:"id"`
		BizTag     string    `db:"biz_tag"`     // 服务名称
		CurrentId  int64     `db:"current_id"`  // 当前id范围
		Step       int64     `db:"step"`        // 步长
		UpdateTime time.Time `db:"update_time"` // 更新时间
	}
)

func newIdSenderModel(conn sqlx.SqlConn) *defaultIdSenderModel {
	return &defaultIdSenderModel{
		conn:  conn,
		table: "`id_sender`",
	}
}

func (m *defaultIdSenderModel) Delete(ctx context.Context, id int64) error {
	query := fmt.Sprintf("delete from %s where `id` = ?", m.table)
	_, err := m.conn.ExecCtx(ctx, query, id)
	return err
}

func (m *defaultIdSenderModel) FindOne(ctx context.Context, id int64) (*IdSender, error) {
	query := fmt.Sprintf("select %s from %s where `id` = ? limit 1", idSenderRows, m.table)
	var resp IdSender
	err := m.conn.QueryRowCtx(ctx, &resp, query, id)
	switch err {
	case nil:
		return &resp, nil
	case sqlx.ErrNotFound:
		return nil, ErrNotFound
	default:
		return nil, err
	}
}

func (m *defaultIdSenderModel) FindOneByBizTag(ctx context.Context, bizTag string) (*IdSender, error) {
	var resp IdSender
	query := fmt.Sprintf("select %s from %s where `biz_tag` = ? limit 1", idSenderRows, m.table)
	err := m.conn.QueryRowCtx(ctx, &resp, query, bizTag)
	switch err {
	case nil:
		return &resp, nil
	case sqlx.ErrNotFound:
		return nil, ErrNotFound
	default:
		return nil, err
	}
}

func (m *defaultIdSenderModel) Insert(ctx context.Context, data *IdSender) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (%s) values (?, ?, ?)", m.table, idSenderRowsExpectAutoSet)
	ret, err := m.conn.ExecCtx(ctx, query, data.BizTag, data.CurrentId, data.Step)
	return ret, err
}

func (m *defaultIdSenderModel) Update(ctx context.Context, bizTag string) error {
	query := fmt.Sprintf(`
		UPDATE %s 
		SET current_id = current_id + step, update_time = CURRENT_TIMESTAMP 
		WHERE biz_tag = ?`, m.table)

	_, err := m.conn.ExecCtx(ctx, query, bizTag)
	return err
}

func (m *defaultIdSenderModel) tableName() string {
	return m.table
}
