DROP TABLE IF EXISTS `good`;
CREATE TABLE `good`
(
    id          INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state   INT         NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    create_time TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
    good_id     INT         NOT NULL COMMENT '分布式唯一ID',
    title   VARCHAR(20) NOT NULL DEFAULT '' COMMENT '商品名称',
    good_tag VARCHAR(20) NOT NULL DEFAULT '' COMMENT '商品标签',
    farm_id     INT         NOT NULL COMMENT '商品所属农场id',
    image_urls  TEXT COMMENT '图片信息',
    price       FLOAT       NOT NULL DEFAULT 0.0 COMMENT '价格',
    units       VARCHAR(10) NOT NULL DEFAULT '' COMMENT '单位,个/斤/千克等',
    repertory   FLOAT       NOT NULL DEFAULT 0.0 COMMENT '库存',
    detail      TEXT COMMENT '详情'

)ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;