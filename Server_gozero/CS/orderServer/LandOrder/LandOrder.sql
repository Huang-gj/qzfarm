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
    order_status VARCHAR(10) NOT NULL COMMENT '订单状态'
)ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;