CREATE
DATABASE qzf
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`
(
    id           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state    INT          NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    create_time  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    user_id      INT          NOT NULL COMMENT '分布式唯一ID',
    phone_number VARCHAR(20)  NOT NULL DEFAULT '' COMMENT '用户电话号码',
    password     VARCHAR(128) NOT NULL DEFAULT '' COMMENT '用户密码',
    avatar       VARCHAR(512) NOT NULL DEFAULT '' COMMENT '用户头像url',
    nickname     VARCHAR(128) NOT NULL DEFAULT '' COMMENT '用户昵称',
    address      VARCHAR(128) NOT NULL DEFAULT '' COMMENT '用户地址',
    gender       TINYINT      NOT NULL DEFAULT 0 COMMENT '0-未知 1-男 2-女'

) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


DROP TABLE IF EXISTS `farm`;
CREATE TABLE `farm`
(

    id             INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state      INT           NOT NULL DEFAULT 0 COMMENT '删除状态，0=正常，1=已删除',
    del_time       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    create_time    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    farm_id        INT           NOT NULL COMMENT '分布式唯一ID',
    admin_id       INT           NOT NULL COMMENT '管理员唯一ID',
    farm_name      VARCHAR(128)  NOT NULL DEFAULT '' COMMENT '农场名称',
    description    TEXT COMMENT '农场描述',
    address        TEXT COMMENT '详细地址',
    logo_url       VARCHAR(512)  NOT NULL DEFAULT '' COMMENT '农场logo',
    image_urls     TEXT COMMENT '农场照片',
    contact_phone  VARCHAR(20)   NOT NULL DEFAULT '' COMMENT '联系电话',
    average_rating DECIMAL(3, 1) NOT NULL DEFAULT 0.0 COMMENT '平均评分',
    status         INT           NOT NULL DEFAULT 0 COMMENT '状态(1=暂停营业,0=正常营业)'

) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS `land`;
CREATE TABLE `land`
(
    id          INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state   INT            NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    create_time TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    land_id     INT            NOT NULL COMMENT '分布式唯一ID',
    farm_id     INT            NOT NULL COMMENT '土地所属农场id',
    land_name   VARCHAR(20)    NOT NULL DEFAULT '' COMMENT '土地名称',
    land_tag VARCHAR(20) NOT NULL DEFAULT '' COMMENT '土地标签',
    area        VARCHAR(64)    NOT NULL DEFAULT '' COMMENT '土地面积',
    image_urls  TEXT COMMENT '图片信息',
    price       DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '价格',
    detail      TEXT COMMENT '详情',
    sale_status TINYINT        NOT NULL DEFAULT 0 COMMENT '租赁状态 0-出售中 1-已被租赁',
    sale_time   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '租赁剩余时间'

)ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


DROP TABLE IF EXISTS `good`;
CREATE TABLE `good`
(
    id          INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state   INT            NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    create_time TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    good_id     INT            NOT NULL COMMENT '分布式唯一ID',
    title   VARCHAR(20)    NOT NULL DEFAULT '' COMMENT '商品名称',
    farm_id     INT            NOT NULL COMMENT '商品所属农场id',
    good_tag VARCHAR(20) NOT NULL DEFAULT '' COMMENT '商品标签',
    image_urls  TEXT COMMENT '图片信息',
    price       DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '价格',
    units       VARCHAR(10)    NOT NULL DEFAULT '' COMMENT '单位,个/斤/千克等',
    repertory   FLOAT          NOT NULL DEFAULT 0.0 COMMENT '库存',
    detail      TEXT COMMENT '详情'

)ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


DROP TABLE IF EXISTS `good_order`;
CREATE TABLE `good_order`
(
    id            INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state     INT            NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    create_time   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    good_order_id INT            NOT NULL COMMENT '分布式唯一ID',
    image_urls    TEXT COMMENT '图片信息',
    good_id       INT            NOT NULL COMMENT '关联商品名称',
    farm_id       INT            NOT NULL COMMENT '商品所属农场id',
    user_id       INT            NOT NULL COMMENT '关联用户id',
    user_address  VARCHAR(128)   NOT NULL COMMENT '用户所在地址',
    farm_address  VARCHAR(128)   NOT NULL COMMENT '农场所在地址',
    price         DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '价格',
    units         VARCHAR(10)    NOT NULL DEFAULT '' COMMENT '单位,个/斤/千克等',
    count         INT            NOT NULL DEFAULT 0 COMMENT '购买数量',
    detail        TEXT COMMENT '详情',
    order_status  VARCHAR(10)    NOT NULL COMMENT '订单状态'

)ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


DROP TABLE IF EXISTS `land_order`;
CREATE TABLE `land_order`
(
    id            INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state     INT            NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    create_time   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    land_order_id INT            NOT NULL COMMENT '分布式唯一ID',
    image_urls    TEXT COMMENT '图片信息',
    land_id       INT            NOT NULL COMMENT '关联土地名称',
    farm_id       INT            NOT NULL COMMENT '商品所属农场id',
    user_id       INT            NOT NULL COMMENT '关联用户id',
    farm_address  VARCHAR(128)   NOT NULL COMMENT '农场所在地址',
    price         DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '价格',
    count         INT            NOT NULL DEFAULT 0 COMMENT '租赁时长',

    detail        TEXT COMMENT '详情',
    order_status  VARCHAR(10)    NOT NULL COMMENT '订单状态'
)ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


DROP TABLE IF EXISTS `id_sender`;
CREATE TABLE `id_sender`
(
    id          INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    biz_tag     VARCHAR(64) NOT NULL DEFAULT '' COMMENT '服务名称',
    current_id  INT         NOT NULL DEFAULT 0 COMMENT '当前id范围',
    step        INT         NOT NULL DEFAULT 0 COMMENT '步长',
    update_time TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间'
)ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment`
(
    id                INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    create_time       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    text              TEXT COMMENT '评论内容',
    comment_id        INT          NOT NULL COMMENT '评论分布式唯一id',
    good_id           INT          NOT NULL COMMENT '关联商品ID',
    land_id           INT          NOT NULL COMMENT '关联土地ID',
    user_id           INT          NOT NULL COMMENT '评论用户id',
    avatar            VARCHAR(512) NOT NULL DEFAULT '' COMMENT '用户头像url',
    nickname          VARCHAR(128) NOT NULL DEFAULT '' COMMENT '用户昵称',
    comment_reply_num INT          NOT NULL DEFAULT 0 COMMENT '该评论有多少回复'

)ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


DROP TABLE IF EXISTS `comment_reply`;
CREATE TABLE `comment_reply`
(
    id               INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    create_time      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    comment_id       INT          NOT NULL COMMENT '关联根评论ID',
    comment_reply_id INT          NOT NULL COMMENT '评论回复分布式唯一ID',
    reply_to         VARCHAR(128) NOT NULL COMMENT '被回复者的Nickname',
    text             TEXT COMMENT '评论内容',
    user_id          INT          NOT NULL COMMENT '评论用户id',
    avatar           VARCHAR(512) NOT NULL DEFAULT '' COMMENT '用户头像url',
    nickname         VARCHAR(128) NOT NULL DEFAULT '' COMMENT '用户昵称'

)ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin`
(
    id           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state    INT          NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    create_time  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    admin_id     INT          NOT NULL COMMENT '分布式唯一ID',
    phone_number VARCHAR(20)  NOT NULL DEFAULT '' COMMENT '用户电话号码',
    password     VARCHAR(128) NOT NULL DEFAULT '' COMMENT '用户密码',
    avatar       VARCHAR(512) NOT NULL DEFAULT '' COMMENT '用户头像url',
    nickname     VARCHAR(128) NOT NULL DEFAULT '' COMMENT '用户昵称',
    qq_email     VARCHAR(128) NOT NULL DEFAULT '' COMMENT '邮箱',
    gender       TINYINT      NOT NULL DEFAULT 0 COMMENT '0-未知 1-男 2-女',
    farm_id      INT          NOT NULL DEFAULT 0 COMMENT '关联农场id'

) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


DROP TABLE IF EXISTS `sale_data`;
CREATE TABLE `sale_data`
(
    id               INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state        INT            NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time         TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    create_time      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    farm_id          INT            NOT NULL DEFAULT 0 COMMENT '关联农场id',
    stat_date        DATE           NOT NULL COMMENT '统计日期',
    good_order_count INT            NOT NULL DEFAULT 0 COMMENT '农产品订单总数',
    land_order_count INT            NOT NULL DEFAULT 0 COMMENT '土地订单总数',
    good_sale_count  DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '农产品订单总销售额',
    land_sale_count  DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '土地订单总销售额',
    sys_use_count    INT            NOT NULL DEFAULT 0 COMMENT '当前系统适用人数'

) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


DELIMITER
$$

CREATE
EVENT daily_sale_data_init_with_error_handling
ON SCHEDULE EVERY 1 DAY
STARTS '2024-01-01 00:00:00'
ON COMPLETION PRESERVE
ENABLE
DO
BEGIN
    DECLARE
exit_sqlstate CHAR(5);
    DECLARE
exit_errno INT;
    DECLARE
exit_message TEXT;
    DECLARE
rows_affected INT DEFAULT 0;

    -- 异常处理器，捕获SQL异常并写日志
    DECLARE
EXIT HANDLER FOR SQLEXCEPTION
BEGIN
ROLLBACK;
GET DIAGNOSTICS CONDITION 1
    exit_sqlstate = RETURNED_SQLSTATE,
    exit_errno = MYSQL_ERRNO,
    exit_message = MESSAGE_TEXT;
INSERT INTO event_log (event_name, execution_time, message)
VALUES ('daily_sale_data_init', NOW(),
        CONCAT('ERROR: SQLSTATE=', exit_sqlstate, ', errno=', exit_errno, ', message=', exit_message));
END;

    -- 事件开始日志
INSERT INTO event_log (event_name, execution_time, message)
VALUES ('daily_sale_data_init', NOW(), 'INFO: Event started');

START TRANSACTION;

INSERT INTO sale_data
(farm_id, stat_date, good_sale_count, land_sale_count, sys_use_count, create_time, del_time)
SELECT f.farm_id,
       CURDATE(),
       0,
       0,
       COALESCE((SELECT sd.sys_use_count
                 FROM sale_data sd
                 WHERE sd.farm_id = f.farm_id
                   AND sd.stat_date = CURDATE() - INTERVAL 1 DAY
                LIMIT 1 ), 0),
       NOW(),
       NOW()
FROM farm f
WHERE f.status = 0
  AND NOT EXISTS (SELECT 1
                  FROM sale_data sd
                  WHERE sd.farm_id = f.farm_id
                    AND sd.stat_date = CURDATE());

SET
rows_affected = ROW_COUNT();

COMMIT;

INSERT INTO event_log (event_name, execution_time, message)
VALUES ('daily_sale_data_init', NOW(),
        CONCAT('SUCCESS: Inserted ', rows_affected, ' rows for date ', CURDATE()));

-- 事件结束日志
INSERT INTO event_log (event_name, execution_time, message)
VALUES ('daily_sale_data_init', NOW(), 'INFO: Event finished successfully');

END$$

DELIMITER ;


DROP TABLE IF EXISTS `activity`;
CREATE TABLE `activity`
(
    id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state   INT          NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    create_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    activity_id INT          NOT NULL DEFAULT 0 COMMENT '活动的分布式唯一ID',
    title       VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '活动标题',
    farm_id     INT          NOT NULL DEFAULT 0 COMMENT '关联农场id',
    MainPic     VARCHAR(128) NOT NULL DEFAULT '' COMMENT '活动主图',
    image_urls  TEXT COMMENT '图片信息',
    text        TEXT COMMENT '活动详情',
    start_time  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '活动开始时间',
    end_time    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '活动结束时间'
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS `category`;
CREATE TABLE `category`
(
    id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state   INT          NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    create_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    category_id INT          NOT NULL DEFAULT 0 COMMENT '分类的分布式唯一ID',
    name       VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '种类名称',
    cate_type    INT         NOT NULL DEFAULT 0 COMMENT '种类类型',
    text    TEXT COMMENT '分类备注',
    image_url VARCHAR(128) NOT NULL DEFAULT '' COMMENT '种类标识图标'
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;