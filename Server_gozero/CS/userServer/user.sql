DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`
(
    id           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    del_state    INT          NOT NULL DEFAULT 0 COMMENT '0-正常 1-删除',
    del_time     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    create_time  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '删除时间',
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