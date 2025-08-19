DROP TABLE IF EXISTS `id_sender`;
CREATE TABLE `id_sender`
(
    id          INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    biz_tag     VARCHAR(64) NOT NULL DEFAULT '' COMMENT '服务名称',
    current_id  INT         NOT NULL DEFAULT 0 COMMENT '当前id范围',
    update_time TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间'
)ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;