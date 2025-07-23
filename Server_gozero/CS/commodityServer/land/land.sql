DROP TABLE IF EXISTS `land`;
CREATE TABLE `land`
(
    id          INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state   INT         NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    create_time TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    land_id     INT         NOT NULL COMMENT '分布式唯一ID',
    farm_id     INT         NOT NULL COMMENT '土地所属农场id',
    land_name   VARCHAR(20) NOT NULL DEFAULT '' COMMENT '土地名称',
    area        VARCHAR(64) NOT NULL DEFAULT '' COMMENT '土地面积',
    image_urls  TEXT COMMENT '图片信息',
    price       FLOAT       NOT NULL DEFAULT 0.0 COMMENT '价格',
    detail      TEXT COMMENT '详情',
    sale_status TINYINT     NOT NULL DEFAULT 0 COMMENT '租赁状态 0-出售中 1-已被租赁',
    sale_time   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '租赁剩余时间'

)ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;