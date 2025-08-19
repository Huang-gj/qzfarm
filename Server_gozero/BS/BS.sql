

DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin`
(
    id           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state    INT          NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    create_time  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
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
    status         INT           NOT NULL DEFAULT 1 COMMENT '状态(1=正常营业,0=暂停营业)'

) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


DROP TABLE IF EXISTS `good_order`;
CREATE TABLE `good_order`
(
    id            INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state     INT          NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    create_time   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    good_order_id INT          NOT NULL COMMENT '分布式唯一ID',
    image_urls    TEXT COMMENT '图片信息',
    good_id       INT          NOT NULL COMMENT '关联商品名称',
    farm_id       INT          NOT NULL COMMENT '商品所属农场id',
    user_id       INT          NOT NULL COMMENT '关联用户id',
    user_address  VARCHAR(128) NOT NULL COMMENT '用户所在地址',
    farm_address  VARCHAR(128) NOT NULL COMMENT '农场所在地址',
    price         FLOAT        NOT NULL DEFAULT 0.0 COMMENT '价格',
    units         VARCHAR(10)  NOT NULL DEFAULT '' COMMENT '单位,个/斤/千克等',
    count         INT          NOT NULL DEFAULT 0 COMMENT '购买数量',
    detail        TEXT COMMENT '详情',
    order_status  VARCHAR(10)  NOT NULL COMMENT '订单状态'

)ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


DROP TABLE IF EXISTS `land_order`;
CREATE TABLE `land_order`
(
    id            INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state     INT          NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    create_time   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    land_order_id INT          NOT NULL COMMENT '分布式唯一ID',
    image_urls    TEXT COMMENT '图片信息',
    land_id       INT          NOT NULL COMMENT '关联土地名称',
    farm_id       INT          NOT NULL COMMENT '商品所属农场id',
    user_id       INT          NOT NULL COMMENT '关联用户id',
    farm_address  VARCHAR(128) NOT NULL COMMENT '农场所在地址',
    price         FLOAT        NOT NULL DEFAULT 0.0 COMMENT '价格',
    count         INT          NOT NULL DEFAULT 0 COMMENT '租赁时长',

    detail        TEXT COMMENT '详情',
    order_status  VARCHAR(10)  NOT NULL COMMENT '订单状态'
)ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;