-- 创建数据库
CREATE
DATABASE qzf
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

/** 农场主表 (farms) **/
DROP TABLE IF EXISTS `farms`;
CREATE TABLE farms
(
    farm_id            INT AUTO_INCREMENT PRIMARY KEY,     -- 农场ID（修正拼写错误）
    farm_name          VARCHAR(128) NOT NULL,              -- 农场名称
    owner_id           INT,                                -- 农场主用户ID（类型改为INT）
    description        TEXT,                               -- 农场描述
    location           VARCHAR(128),                       -- 农场位置描述
    address_detail     TEXT,                               -- 详细地址
    latitude           DECIMAL(9, 6),                      -- 纬度
    longitude          DECIMAL(9, 6),                      -- 经度
    farm_size          DECIMAL(10, 2),                     -- 农场总面积(亩)
    farm_type          INT,                                -- 农场类型(1=...,2=...,3=...)
    certification      VARCHAR(128),                       -- 农场认证情况
    main_products      TEXT,                               -- 主要产品
    logo_url           VARCHAR(512),                       -- 农场logo
    image_urls         JSON,                               -- 农场照片
    contact_phone      VARCHAR(20),                        -- 联系电话
    establishment_date DATE,                               -- 成立日期
    business_hours     VARCHAR(128),                       -- 营业时间
    farm_features      JSON,                               -- 农场特色
    average_rating     DECIMAL(2, 1),                      -- 平均评分
    status             INT       DEFAULT 1,                -- 状态(1=正常营业,0=暂停营业)
    del_state          INT       DEFAULT 0,                -- 删除状态，0=正常，1=已删除
    del_time           TIMESTAMP NULL,                     -- 删除时间
    create_time        TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 创建时间
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 用户信息表 (user_info) **/
DROP TABLE IF EXISTS `user_info`;
CREATE TABLE user_info
(
    user_id           INT AUTO_INCREMENT PRIMARY KEY,          -- 用户ID（修正拼写错误）
    user_account      VARCHAR(128),
    user_passwd       VARCHAR(128),
    avatar_url        VARCHAR(512),                            -- 用户头像URL
    nick_name         VARCHAR(128),                            -- 用户昵称
    phone_number      VARCHAR(20),                             -- 用户电话号码
    gender            INT,                                     -- 用户性别(1=男，2=女)
    /* 农场用户扩展 */
    is_farmer         BOOLEAN   DEFAULT FALSE,                 -- 是否为农场用户（农场主）
    favorite_units    JSON,                                    -- 用户偏好的农场单元，JSON格式
    adopted_units     JSON,                                    -- 用户认养的农场单元，JSON格式
    farm_visit_count  INT       DEFAULT 0,                     -- 用户访问农场的次数
    last_visit_date   DATE,                                    -- 用户最后访问农场的日期
    last_login_time   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    preferred_farm_id INT DEFAULT NULL,
    del_state         INT       DEFAULT 0,                     -- 删除状态，0=正常，1=已删除
    del_time          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,                          -- 删除时间
    create_time       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,     -- 创建时间                 -- 用户偏好的农场ID（类型改为INT）
    FOREIGN KEY (preferred_farm_id) REFERENCES farms (farm_id) -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 用户地址表 (user_addresses) **/
DROP TABLE IF EXISTS `user_addresses`;
CREATE TABLE user_addresses
(
    address_id        INT AUTO_INCREMENT PRIMARY KEY,     -- 地址ID（修正拼写错误）
    saas_id           VARCHAR(128),                       -- SaaS ID
    uid               INT,                                -- 用户ID（类型改为INT）
    auth_token        VARCHAR(128),                       -- 授权Token
    phone             VARCHAR(20),                        -- 联系电话
    name              VARCHAR(128),                       -- 用户姓名
    country_name      VARCHAR(128),                       -- 国家名称
    country_code      VARCHAR(10),                        -- 国家代码
    province_name     VARCHAR(128),                       -- 省份名称
    province_code     VARCHAR(20),                        -- 省份代码
    city_name         VARCHAR(128),                       -- 城市名称
    city_code         VARCHAR(20),                        -- 城市代码
    district_name     VARCHAR(128),                       -- 区县名称
    district_code     VARCHAR(20),                        -- 区县代码
    detail_address    VARCHAR(128),                       -- 详细地址
    is_default        INT,                                -- 是否为默认地址（0=否，1=是）
    address_tag       VARCHAR(50),                        -- 地址标签（如：公司、家庭等）
    latitude          DECIMAL(9, 6),                      -- 纬度
    longitude         DECIMAL(9, 6),                      -- 经度
    /* 农场地址扩展 */
    distance_to_farm  DECIMAL(10, 2),                     -- 到农场的距离(公里)
    in_delivery_range BOOLEAN   DEFAULT TRUE,             -- 是否在配送范围内
    del_state         INT       DEFAULT 0,                -- 删除状态，0=正常，1=已删除
    del_time          TIMESTAMP NULL,                     -- 删除时间
    create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- 创建时间
    FOREIGN KEY (uid) REFERENCES user_info (user_id)      -- 外键，关联用户信息表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 商品分类表 (product_categories) - 添加缺失的表 **/
DROP TABLE IF EXISTS `product_categories`;
CREATE TABLE product_categories
(
    category_id   INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(128) NOT NULL,
    description   TEXT,
    parent_id     INT,
    image_url     VARCHAR(512),
    status        INT       DEFAULT 1,
    del_state     INT       DEFAULT 0,                -- 删除状态，0=正常，1=已删除
    del_time      TIMESTAMP NULL,                     -- 删除时间
    create_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- 创建时间
    FOREIGN KEY (parent_id) REFERENCES product_categories (category_id)
) ENGINE=InnoDB
CHARACTER SET=utf8mb4
COLLATE=utf8mb4_general_ci
ROW_FORMAT=Dynamic;

/**农场商品表 (farm_products) - 替代原goods表 **/
DROP TABLE IF EXISTS `farm_products`;
CREATE TABLE farm_products
(
    product_id        INT AUTO_INCREMENT PRIMARY KEY,                     -- 商品ID
    farm_id           INT            NOT NULL,                            -- 关联农场ID
    title             VARCHAR(128)   NOT NULL,                            -- 商品名称
    primary_image     VARCHAR(512),                                       -- 商品主图URL
    price             DECIMAL(10, 2) NOT NULL,                            -- 售价
    stock_quantity    INT            NOT NULL,                            -- 库存数量
    sold_num          INT       DEFAULT 0,                                -- 销售数量
    is_available      BOOLEAN   DEFAULT TRUE,                             -- 是否可用
    unit              VARCHAR(50)    NOT NULL,                            -- 计量单位（如"斤"、"个"、"箱"）
    description       TEXT,                                               -- 商品描述
    images            JSON,                                               -- 商品图片集，JSON格式
    category_id       INT,                                                -- 商品分类ID
    is_featured       BOOLEAN   DEFAULT FALSE,                            -- 是否为推荐商品
    harvest_date      DATE,                                               -- 收获日期
    freshness_period  INT,                                                -- 新鲜期（天数）
    growth_cycle      INT,                                                -- 生长周期（天数）
    planting_method   VARCHAR(128),                                       -- 种植方法
    organic_certified BOOLEAN   DEFAULT FALSE,                            -- 是否有机认证
    pesticide_free    BOOLEAN   DEFAULT FALSE,                            -- 是否无农药
    fertilizer_used   VARCHAR(128),                                       -- 使用的肥料
    harvest_id        INT,                                                -- 关联的收获记录ID
    farm_unit_id      INT,                                                -- 关联的认养单元ID
    nutritional_value TEXT,                                               -- 营养价值
    storage_method    VARCHAR(128),                                       -- 储存方法
    del_state         INT       DEFAULT 0,                                -- 删除状态，0=正常，1=已删除
    del_time          TIMESTAMP NULL,                                     -- 删除时间
    create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                -- 创建时间
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id),                     -- 外键，关联农场表
    FOREIGN KEY (category_id) REFERENCES product_categories (category_id) -- 外键，关联商品分类表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/**商品评论汇总表 (product_comment_summary) **/
DROP TABLE IF EXISTS `product_comment_summary`;
CREATE TABLE product_comment_summary
(
    summary_id      INT AUTO_INCREMENT PRIMARY KEY,                -- 评论汇总记录ID
    product_id      INT,                                           -- 商品ID
    order_no        VARCHAR(128),                                  -- 订单号
    logistics_score INT,                                           -- 物流评分
    service_score   INT,                                           -- 服务评分
    del_state       INT       DEFAULT 0,                           -- 删除状态，0=正常，1=已删除
    del_time        TIMESTAMP NULL,                                -- 删除时间
    create_time     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           -- 创建时间         -- 创建时间
    farm_id         INT,                                           -- 关联农场ID
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id),              -- 外键，引用农场ID
    FOREIGN KEY (product_id) REFERENCES farm_products (product_id) -- 外键，关联商品表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/**评论主表 (product_comments) **/
DROP TABLE IF EXISTS `product_comments`;
CREATE TABLE product_comments
(
    id                        INT AUTO_INCREMENT PRIMARY KEY,                 -- 评论ID
    summary_id                INT,                                            -- 关联商品评论汇总表ID
    uid                       INT,                                            -- 用户ID
    user_name                 VARCHAR(128),                                   -- 用户名
    user_head_url             VARCHAR(512),                                   -- 用户头像URL
    product_name              VARCHAR(128),                                   -- 被评论的商品名称
    comment_id_image_url      VARCHAR(512),                                   -- 被评论的商品图片URL
    comment_stage             INT,                                            -- 评论阶段
    comment_check_status      INT,                                            -- 审核状态
    comment_id_type           INT,                                            -- 评论类型
    content                   TEXT,                                           -- 评论内容
    is_again_comment          BOOLEAN,                                        -- 是否为追加评论
    comment_has_again_comment BOOLEAN,                                        -- 是否允许追加评论
    is_anonymous              BOOLEAN,                                        -- 是否匿名评论
    specification             VARCHAR(128),                                   -- 商品规格文本
    specification_json        JSON,                                           -- 商品规格的JSON结构
    comment_extend_id         VARCHAR(128),                                   -- 扩展评论ID
    comment_time              BIGINT,                                         -- 评论时间（毫秒级时间戳）
    score                     INT,                                            -- 综合评分
    goods_score               INT,                                            -- 商品质量评分
    freight_score             INT,                                            -- 物流服务评分
    service_score_comment     INT,                                            -- 商家服务评分
    farm_id                   INT,                                            -- 关联农场ID
    farm_unit_id              INT,                                            -- 认养单元ID
    adoption_experience_score INT,                                            -- 认养体验评分
    farm_service_score        INT,
    del_state                 INT       DEFAULT 0,                            -- 删除状态，0=正常，1=已删除
    del_time                  TIMESTAMP NULL,                                 -- 删除时间
    create_time               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,            -- 创建时间                                       -- 农场服务评分
    FOREIGN KEY (summary_id) REFERENCES product_comment_summary (summary_id), -- 外键，关联评论汇总表
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id),                         -- 外键，引用农场ID
    FOREIGN KEY (uid) REFERENCES user_info (user_id)                          -- 外键，关联用户信息表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 评论媒体表 (comment_medias) 存储评论中的图像信息 **/
DROP TABLE IF EXISTS `comment_medias`;
CREATE TABLE comment_medias
(
    media_id    INT AUTO_INCREMENT PRIMARY KEY,               -- 媒体资源ID
    comment_id  INT,                                          -- 关联评论ID
    media_url   VARCHAR(512) NOT NULL,                        -- 媒体资源URL（图片/视频）
    del_state   INT       DEFAULT 0,                          -- 删除状态，0=正常，1=已删除
    del_time    TIMESTAMP NULL,                               -- 删除时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,          -- 创建时间
    FOREIGN KEY (comment_id) REFERENCES product_comments (id) -- 外键，关联评论ID
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/**评论回复表 (comment_replies) **/
DROP TABLE IF EXISTS `comment_replies`;
CREATE TABLE comment_replies
(
    reply_id      INT AUTO_INCREMENT PRIMARY KEY,              -- 回复记录ID
    comment_id    INT,                                         -- 关联评论ID
    reply_content TEXT,                                        -- 回复内容
    reply_user_id INT,                                         -- 回复用户ID（商家或用户）
    reply_time    BIGINT,                                      -- 回复时间（毫秒级时间戳）
    del_state     INT       DEFAULT 0,                         -- 删除状态，0=正常，1=已删除
    del_time      TIMESTAMP NULL,                              -- 删除时间
    create_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,         -- 创建时间
    FOREIGN KEY (comment_id) REFERENCES product_comments (id), -- 外键，关联评论ID
    FOREIGN KEY (reply_user_id) REFERENCES user_info (user_id) -- 外键，关联用户信息表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/***订单结算模块设计***/
/**订单结算汇总表 (order_settle_summary) **/
DROP TABLE IF EXISTS `order_settle_summary`;
CREATE TABLE order_settle_summary
(
    settle_id              INT AUTO_INCREMENT PRIMARY KEY,                -- 结算ID
    total_goods_count      INT,                                           -- 商品总数
    package_count          INT,                                           -- 包裹数量
    total_amount           DECIMAL(10, 2),                                -- 总金额
    total_pay_amount       DECIMAL(10, 2),                                -- 实际支付金额
    total_discount_amount  DECIMAL(10, 2),                                -- 总折扣金额
    total_promotion_amount DECIMAL(10, 2),                                -- 总优惠金额
    total_coupon_amount    DECIMAL(10, 2),                                -- 优惠券金额
    total_sale_price       DECIMAL(10, 2),                                -- 商品销售总金额
    total_goods_amount     DECIMAL(10, 2),                                -- 商品总金额
    total_delivery_fee     DECIMAL(10, 2),                                -- 配送费用
    invoice_request        VARCHAR(128),                                  -- 发票请求
    invoice_support        BOOLEAN,                                       -- 是否支持开具发票
    settle_type            INT,                                           -- 结算类型
    user_address_id        INT,                                           -- 用户地址ID
    del_state              INT       DEFAULT 0,                           -- 删除状态，0=正常，1=已删除
    del_time               TIMESTAMP NULL,                                -- 删除时间
    create_time            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           -- 创建时间
    order_type             INT       DEFAULT 1,                           -- 订单类型
    adoption_id            INT,                                           -- 认养ID
    farm_id                INT,                                           -- 关联农场ID
    farm_unit_id           INT,                                           -- 认养单元ID
    adoption_start_date    DATE,                                          -- 认养开始日期
    adoption_end_date      DATE,                                          -- 认养结束日期
    user_id                INT,                                           -- 用户ID
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id),                     -- 外键，关联农场ID
    FOREIGN KEY (user_address_id) REFERENCES user_addresses (address_id), -- 外键，关联用户地址表
    FOREIGN KEY (user_id) REFERENCES user_info (user_id)                  -- 外键，关联用户信息表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 订单商品详情表 (order_product_details) **/
DROP TABLE IF EXISTS `order_product_details`;
CREATE TABLE order_product_details
(
    detail_id         INT AUTO_INCREMENT PRIMARY KEY,                    -- 订单商品详情ID
    settle_id         INT NOT NULL,                                      -- 关联结算ID
    product_id        INT NOT NULL,                                      -- 商品ID
    farm_id           INT NOT NULL,                                      -- 关联农场ID
    product_name      VARCHAR(128),                                      -- 商品名称
    image             VARCHAR(512),                                      -- 商品图片URL
    quantity          INT NOT NULL,                                      -- 商品数量
    unit              VARCHAR(50),                                       -- 计量单位
    unit_price        DECIMAL(10, 2),                                    -- 单价
    total_price       DECIMAL(10, 2),                                    -- 总价
    discount_price    DECIMAL(10, 2) DEFAULT 0,                          -- 折扣金额
    actual_price      DECIMAL(10, 2),                                    -- 实际支付价格
    is_farm_product   BOOLEAN        DEFAULT TRUE,                       -- 是否为农场产品
    harvest_id        INT,                                               -- 收获ID
    harvest_date      DATE,                                              -- 收获日期
    organic_certified BOOLEAN        DEFAULT FALSE,                      -- 是否有机认证
    planting_method   VARCHAR(128),                                      -- 种植方法
    del_state         INT            DEFAULT 0,                          -- 删除状态，0=正常，1=已删除
    del_time          TIMESTAMP NULL,                                    -- 删除时间
    create_time       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,          -- 创建时间
    FOREIGN KEY (settle_id) REFERENCES order_settle_summary (settle_id), -- 外键，关联订单结算表
    FOREIGN KEY (product_id) REFERENCES farm_products (product_id),      -- 外键，关联商品表
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id)                     -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 订单优惠券表 (order_coupons) **/
DROP TABLE IF EXISTS `order_coupons`;
CREATE TABLE order_coupons
(
    coupon_id                INT AUTO_INCREMENT PRIMARY KEY,             -- 优惠券ID
    settle_id                INT,                                        -- 结算ID
    coupon_value             DECIMAL(10, 2),                             -- 优惠券面值
    coupon_type              INT,                                        -- 优惠券类型
    status                   VARCHAR(50),                                -- 优惠券状态
    used_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- 使用时间
    farm_id                  INT,                                        -- 关联农场ID
    applicable_adoption_type INT,                                        -- 适用的认养类型
    del_state                INT       DEFAULT 0,                        -- 删除状态，0=正常，1=已删除
    del_time                 TIMESTAMP NULL,                             -- 删除时间
    create_time              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- 创建时间
    FOREIGN KEY (settle_id) REFERENCES order_settle_summary (settle_id), -- 外键，关联订单结算表
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id)                     -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


/** 订单配送表 (order_delivery) **/
DROP TABLE IF EXISTS `order_delivery`;
CREATE TABLE order_delivery
(
    delivery_id               INT AUTO_INCREMENT PRIMARY KEY,            -- 配送ID
    settle_id                 INT,                                       -- 关联结算ID - 修正为INT类型
    delivery_fee              DECIMAL(10, 2),                            -- 配送费用
    delivery_words            VARCHAR(128),                              -- 配送备注/描述
    delivery_time             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,       -- 配送时间
    farm_id                   INT,                                       -- 关联农场ID - 修正为INT类型
    is_direct_from_farm       BOOLEAN   DEFAULT FALSE,                   -- 是否直接从农场发货
    harvest_to_delivery_hours INT,                                       -- 从收获到配送的时间（小时）
    farm_pickup_available     BOOLEAN   DEFAULT FALSE,
    del_state                 INT       DEFAULT 0,                       -- 删除状态，0=正常，1=已删除
    del_time                  TIMESTAMP NULL,                            -- 删除时间
    create_time               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,       -- 创建时间
    FOREIGN KEY (settle_id) REFERENCES order_settle_summary (settle_id), -- 外键，关联订单结算表
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id)                     -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 促销活动表 (promotion_activity) **/
DROP TABLE IF EXISTS `promotion_activity`;
CREATE TABLE promotion_activity
(
    promotion_id       INT AUTO_INCREMENT PRIMARY KEY,      -- 促销活动ID
    title              VARCHAR(128),                        -- 促销活动标题
    description        TEXT,                                -- 促销活动描述
    promotion_code     VARCHAR(128),                        -- 促销代码
    promotion_sub_code VARCHAR(128),                        -- 促销子代码
    tag                VARCHAR(50),                         -- 促销活动标签
    time_type          INT,                                 -- 时间类型（1=固定时间，其他可扩展）
    start_time         BIGINT,                              -- 活动开始时间（毫秒级时间戳）
    end_time           BIGINT,                              -- 活动结束时间（毫秒级时间戳）
    teasing_start_time BIGINT,                              -- 预热开始时间（毫秒级时间戳）
    activity_ladder    JSON,                                -- 活动阶梯（JSON格式）
    farm_id            INT,                                 -- 关联农场ID - 修正为INT类型
    is_farm_activity   BOOLEAN   DEFAULT FALSE,             -- 是否为农场促销活动
    farm_activity_type INT,                                 -- 农场活动类型
    farm_area_ids      JSON,                                -- 关联农场区域ID
    del_state          INT       DEFAULT 0,                 -- 删除状态，0=正常，1=已删除
    del_time           TIMESTAMP NULL,                      -- 删除时间
    create_time        TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id)        -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 历史搜索表 (search_history) **/
DROP TABLE IF EXISTS `search_history`;
CREATE TABLE search_history
(
    history_id  INT AUTO_INCREMENT PRIMARY KEY,           -- 历史搜索记录ID
    user_id     INT,                                      -- 用户ID - 修正为INT类型
    search_word VARCHAR(128),                             -- 搜索词
    search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- 搜索时间
    farm_id     INT,                                      -- 关联农场ID - 修正为INT类型
    del_state   INT       DEFAULT 0,                      -- 删除状态，0=正常，1=已删除
    del_time    TIMESTAMP NULL,                           -- 删除时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- 创建时间
    FOREIGN KEY (user_id) REFERENCES user_info (user_id), -- 外键，关联用户信息表
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id)      -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 热门搜索表 (search_popular) **/
DROP TABLE IF EXISTS `search_popular`;
CREATE TABLE search_popular
(
    popular_id      INT AUTO_INCREMENT PRIMARY KEY,      -- 热门搜索记录ID
    search_word     VARCHAR(128),                        -- 搜索词
    search_count    INT       DEFAULT 0,                 -- 搜索次数
    last_updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 最后更新时间
    farm_id         INT,                                 -- 关联农场ID - 修正为INT类型
    is_farm_related BOOLEAN   DEFAULT FALSE,             -- 是否与农场相关
    season_relevant VARCHAR(50),                         -- 与季节相关的字段
    del_state       INT       DEFAULT 0,                 -- 删除状态，0=正常，1=已删除
    del_time        TIMESTAMP NULL,                      -- 删除时间
    create_time     TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id)     -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 搜索结果表 **/
DROP TABLE IF EXISTS `search_results`;
CREATE TABLE search_results
(
    result_id    INT AUTO_INCREMENT PRIMARY KEY,      -- 搜索结果ID
    saas_id      VARCHAR(128),                        -- SaaS ID
    page_num     INT       DEFAULT 1,                 -- 当前页码
    page_size    INT       DEFAULT 30,                -- 每页显示的记录数
    total_count  INT,                                 -- 总记录数
    alg_id       INT       DEFAULT 0,                 -- 算法ID
    product_list JSON,                                -- 商品列表，JSON格式
    search_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 搜索时间
    farm_id      INT,                                 -- 关联农场ID - 修正为INT类型
    del_state    INT       DEFAULT 0,                 -- 删除状态，0=正常，1=已删除
    del_time     TIMESTAMP NULL,                      -- 删除时间
    create_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id)  -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 账户数据表 (user_account) **/
DROP TABLE IF EXISTS `user_account`;
CREATE TABLE user_account
(
    account_id    INT AUTO_INCREMENT PRIMARY KEY,         -- 账户ID
    user_id       INT,                                    -- 用户ID - 修正为INT类型
    num           INT,                                    -- 账户余额/积分数量
    name          VARCHAR(50),                            -- 账户名称（如积分、余额）
    type          VARCHAR(50),                            -- 账户类型（如'积分'、'余额'）
    farm_id       INT,                                    -- 关联农场ID - 修正为INT类型
    farm_points   INT       DEFAULT 0,                    -- 用户在特定农场的积分
    adoption_days INT       DEFAULT 0,                    -- 用户认养天数
    del_state     INT       DEFAULT 0,                    -- 删除状态，0=正常，1=已删除
    del_time      TIMESTAMP NULL,                         -- 删除时间
    create_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- 创建时间
    FOREIGN KEY (user_id) REFERENCES user_info (user_id), -- 外键，关联用户信息表
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id)      -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 客户服务信息表 (customer_service_info) **/
DROP TABLE IF EXISTS `customer_service_info`;
CREATE TABLE customer_service_info
(
    service_id               INT AUTO_INCREMENT PRIMARY KEY,     -- 服务ID
    service_phone            VARCHAR(20),                        -- 客服电话
    service_time_duration    VARCHAR(128),                       -- 客服服务时间（如"9:00-18:00"）
    farm_id                  INT,                                -- 关联农场ID - 修正为INT类型
    farm_service_phone       VARCHAR(20),                        -- 农场客服电话
    farmer_consult_available BOOLEAN   DEFAULT FALSE,            -- 是否提供农场咨询服务
    farm_visit_booking       BOOLEAN   DEFAULT FALSE,            -- 是否支持预约农场参观
    del_state                INT       DEFAULT 0,                -- 删除状态，0=正常，1=已删除
    del_time                 TIMESTAMP NULL,                     -- 删除时间
    create_time              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- 创建时间
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id)             -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 农场区域表 (farm_areas) **/
DROP TABLE IF EXISTS `farm_areas`;
CREATE TABLE farm_areas
(
    area_id        INT AUTO_INCREMENT PRIMARY KEY,      -- 区域ID
    farm_id        INT          NOT NULL,               -- 关联农场ID - 修正为INT类型
    name           VARCHAR(128) NOT NULL,               -- 区域名称
    description    TEXT,                                -- 区域描述
    location       VARCHAR(128),                        -- 区域位置描述
    total_size     DECIMAL(10, 2),                      -- 区域总面积
    available_size DECIMAL(10, 2),                      -- 可用面积
    image_urls     JSON,                                -- 区域图片列表，JSON格式
    status         INT       DEFAULT 1,                 -- 区域状态(1=正常, 0=不可用)
    del_state      INT       DEFAULT 0,                 -- 删除状态，0=正常，1=已删除
    del_time       TIMESTAMP NULL,                      -- 删除时间
    create_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id)    -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 农场认养单元表 (farm_units) **/
DROP TABLE IF EXISTS `farm_units`;
CREATE TABLE farm_units
(
    unit_id             INT AUTO_INCREMENT PRIMARY KEY,      -- 单元ID
    farm_id             INT NOT NULL,                        -- 关联农场ID - 修正为INT类型
    area_id             INT,                                 -- 关联区域ID - 修正为INT类型
    unit_type           INT,                                 -- 单元类型（如种植、养殖等）
    name                VARCHAR(128),                        -- 单元名称
    description         TEXT,                                -- 单元描述
    size                DECIMAL(10, 2),                      -- 单元大小（亩）
    price_per_day       DECIMAL(10, 2),                      -- 每天价格
    min_days            INT,                                 -- 最小认养天数
    max_days            INT,                                 -- 最大认养天数
    image_urls          JSON,                                -- 单元图片列表，JSON格式
    video_url           VARCHAR(512),                        -- 单元介绍视频URL
    location_coordinate VARCHAR(50),                         -- 单元地理坐标
    plant_options       JSON,                                -- 可种植的作物选择，JSON格式
    fish_options        JSON,                                -- 可养殖的鱼类选择，JSON格式
    current_status      INT,                                 -- 当前状态(如空闲、认养中等)
    is_featured         BOOLEAN   DEFAULT FALSE,             -- 是否为推荐单元
    del_state           INT       DEFAULT 0,                 -- 删除状态，0=正常，1=已删除
    del_time            TIMESTAMP NULL,                      -- 删除时间
    create_time         TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id),        -- 外键，关联农场表
    FOREIGN KEY (area_id) REFERENCES farm_areas (area_id)    -- 外键，关联农场区域表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 认养订单表 (adoption_orders) **/
DROP TABLE IF EXISTS `adoption_orders`;
CREATE TABLE adoption_orders
(
    adoption_id          INT AUTO_INCREMENT PRIMARY KEY,      -- 认养订单ID
    user_id              INT,                                 -- 用户ID - 修正为INT类型
    farm_id              INT NOT NULL,                        -- 关联农场ID - 修正为INT类型
    unit_id              INT,                                 -- 关联农场单元ID - 修正为INT类型
    start_date           DATE,                                -- 认养开始日期
    end_date             DATE,                                -- 认养结束日期
    total_days           INT,                                 -- 认养总天数
    total_amount         DECIMAL(10, 2),                      -- 总金额
    payment_status       INT,                                 -- 支付状态（如已支付、未支付）
    adoption_status      INT,                                 -- 认养状态（如进行中、已完成）
    plant_selection      JSON,                                -- 选择的作物种类，JSON格式
    fish_selection       JSON,                                -- 选择的养殖品种，JSON格式
    special_requirements TEXT,                                -- 特殊要求
    del_state            INT       DEFAULT 0,                 -- 删除状态，0=正常，1=已删除
    del_time             TIMESTAMP NULL,                      -- 删除时间
    create_time          TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    FOREIGN KEY (user_id) REFERENCES user_info (user_id),     -- 外键，关联用户信息表
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id),         -- 外键，关联农场表
    FOREIGN KEY (unit_id) REFERENCES farm_units (unit_id)     -- 外键，关联农场单元表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 农产品收获表 (harvest_records) **/
DROP TABLE IF EXISTS `harvest_records`;
CREATE TABLE `harvest_records`
(
    harvest_id      INT AUTO_INCREMENT PRIMARY KEY,                           -- 收获记录ID
    farm_id         INT NOT NULL,                                             -- 关联农场ID - 修正为INT类型
    adoption_id     INT,                                                      -- 关联认养订单ID - 修正为INT类型
    user_id         INT,                                                      -- 用户ID - 修正为INT类型
    unit_id         INT,                                                      -- 关联农场单元ID - 修正为INT类型
    product_type    VARCHAR(128),                                             -- 产品类型（如作物、鱼类等）
    product_name    VARCHAR(128),                                             -- 产品名称
    quantity        DECIMAL(10, 2),                                           -- 收获数量
    unit            VARCHAR(50),                                              -- 单位（如公斤、条等）
    harvest_date    DATE,                                                     -- 收获日期
    delivery_method INT,                                                      -- 配送方式（如自取、配送等）
    delivery_status INT,                                                      -- 配送状态
    image_urls      JSON,                                                     -- 收获产品图片，JSON格式
    notes           TEXT,                                                     -- 备注
    del_state       INT       DEFAULT 0,                                      -- 删除状态，0=正常，1=已删除
    del_time        TIMESTAMP NULL,                                           -- 删除时间
    create_time     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                      -- 创建时间
    FOREIGN KEY (`farm_id`) REFERENCES `farms` (`farm_id`),                   -- 外键，关联农场表
    FOREIGN KEY (`adoption_id`) REFERENCES `adoption_orders` (`adoption_id`), -- 外键，关联认养订单表
    FOREIGN KEY (`user_id`) REFERENCES `user_info` (`user_id`),               -- 外键，关联用户信息表
    FOREIGN KEY (`unit_id`) REFERENCES `farm_units` (`unit_id`)               -- 外键，关联农场单元表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 农场动态表 (farm_activities) **/
DROP TABLE IF EXISTS `farm_activities`;
CREATE TABLE `farm_activities`
(
    activity_id   INT AUTO_INCREMENT PRIMARY KEY,                            -- 活动ID
    farm_id       INT NOT NULL,                                              -- 关联农场ID - 修正为INT类型
    unit_id       INT,                                                       -- 关联农场单元ID - 修正为INT类型
    adoption_id   INT,                                                       -- 关联认养订单ID - 修正为INT类型
    activity_type INT,                                                       -- 活动类型
    title         VARCHAR(128),                                              -- 活动标题
    description   TEXT,                                                      -- 活动描述
    image_urls    JSON,                                                      -- 活动图片列表，JSON格式
    video_url     VARCHAR(512),                                              -- 活动视频URL
    activity_date DATE,                                                      -- 活动日期
    operator      VARCHAR(128),                                              -- 操作员
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                       -- 创建时间
    del_state     INT       DEFAULT 0,                                       -- 删除状态，0=正常，1=已删除
    del_time      TIMESTAMP NULL,                                            -- 删除时间
    create_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                       -- 创建时间
    FOREIGN KEY (`farm_id`) REFERENCES `farms` (`farm_id`),                  -- 外键，关联农场表
    FOREIGN KEY (`unit_id`) REFERENCES `farm_units` (`unit_id`),             -- 外键，关联农场单元表
    FOREIGN KEY (`adoption_id`) REFERENCES `adoption_orders` (`adoption_id`) -- 外键，关联认养订单表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 认养周期计划表 (adoption_cycle_plans) **/
DROP TABLE IF EXISTS `adoption_cycle_plans`;
CREATE TABLE `adoption_cycle_plans`
(
    plan_id         INT AUTO_INCREMENT PRIMARY KEY,        -- 周期计划ID
    farm_id         INT NOT NULL,                          -- 关联农场ID - 修正为INT类型
    unit_type       INT,                                   -- 单元类型
    product_type    VARCHAR(128),                          -- 产品类型
    cycle_name      VARCHAR(128),                          -- 周期名称
    total_days      INT,                                   -- 总天数
    stages          JSON,                                  -- 计划阶段，JSON格式
    expected_output VARCHAR(128),                          -- 预期产出
    del_state       INT       DEFAULT 0,                   -- 删除状态，0=正常，1=已删除
    del_time        TIMESTAMP NULL,                        -- 删除时间
    create_time     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   -- 创建时间
    FOREIGN KEY (`farm_id`) REFERENCES `farms` (`farm_id`) -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 农场实时监控表 (farm_monitors) **/
DROP TABLE IF EXISTS `farm_monitors`;
CREATE TABLE `farm_monitors`
(
    monitor_id  INT AUTO_INCREMENT PRIMARY KEY,                 -- 监控ID
    farm_id     INT NOT NULL,                                   -- 关联农场ID - 修正为INT类型
    unit_id     INT,                                            -- 关联农场单元ID - 修正为INT类型
    camera_url  VARCHAR(512),                                   -- 摄像头URL
    status      INT,                                            -- 状态（1=开启，0=关闭）
    del_state   INT       DEFAULT 0,                            -- 删除状态，0=正常，1=已删除
    del_time    TIMESTAMP NULL,                                 -- 删除时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,            -- 创建时间
    FOREIGN KEY (`farm_id`) REFERENCES `farms` (`farm_id`),     -- 外键，关联农场表
    FOREIGN KEY (`unit_id`) REFERENCES `farm_units` (`unit_id`) -- 外键，关联农场单元表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 农场评价表 (farm_reviews) **/
DROP TABLE IF EXISTS `farm_reviews`;
CREATE TABLE `farm_reviews`
(
    review_id   INT AUTO_INCREMENT PRIMARY KEY,                -- 评价ID
    farm_id     INT NOT NULL,                                  -- 关联农场ID - 修正为INT类型
    user_id     INT NOT NULL,                                  -- 关联用户ID - 修正为INT类型
    content     TEXT,                                          -- 评价内容
    rating      DECIMAL(2, 1),                                 -- 评分（1-5）
    visit_date  DATE,                                          -- 访问日期
    image_urls  JSON,                                          -- 图片列表，JSON格式
    status      INT       DEFAULT 1,                           -- 状态(1=已发布,0=待审核)
    del_state   INT       DEFAULT 0,                           -- 删除状态，0=正常，1=已删除
    del_time    TIMESTAMP NULL,                                -- 删除时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           -- 创建时间
    FOREIGN KEY (`farm_id`) REFERENCES `farms` (`farm_id`),    -- 外键，关联农场表
    FOREIGN KEY (`user_id`) REFERENCES `user_info` (`user_id`) -- 外键，关联用户信息表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 农场管理员 **/
DROP TABLE IF EXISTS `farm_managers`;
CREATE TABLE farm_managers
(
    manager_id  INT AUTO_INCREMENT PRIMARY KEY,          -- 管理员ID
    farm_id     INT NOT NULL,                            -- 关联农场ID - 修正为INT类型
    user_id     INT NOT NULL,                            -- 关联用户ID - 修正为INT类型
    role        VARCHAR(50),                             -- 角色（如owner、manager、staff）
    permissions JSON,                                    -- 权限设置，JSON格式
    del_state   INT       DEFAULT 0,                     -- 删除状态，0=正常，1=已删除
    del_time    TIMESTAMP NULL,                          -- 删除时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- 创建时间
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id),    -- 外键，关联农场表
    FOREIGN KEY (user_id) REFERENCES user_info (user_id) -- 外键，关联用户信息表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 农场营业时间表 (farm_business_hours) **/
DROP TABLE IF EXISTS `farm_business_hours`;
CREATE TABLE farm_business_hours
(
    id          INT AUTO_INCREMENT PRIMARY KEY,      -- 时间记录ID
    farm_id     INT NOT NULL,                        -- 关联农场ID - 修正为INT类型
    day_of_week INT,                                 -- 周几（1-7）
    open_time   TIME,                                -- 开始时间
    close_time  TIME,                                -- 结束时间
    is_closed   BOOLEAN DEFAULT FALSE,               -- 是否休息（1=休息，0=营业）
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id) -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 农场活动预约表 (farm_event_bookings) **/
DROP TABLE IF EXISTS `farm_event_bookings`;
CREATE TABLE farm_event_bookings
(
    booking_id  INT AUTO_INCREMENT PRIMARY KEY,          -- 预约ID
    farm_id     INT NOT NULL,                            -- 关联农场ID - 修正为INT类型
    user_id     INT NOT NULL,                            -- 用户ID - 修正为INT类型
    event_name  VARCHAR(128),                            -- 活动名称
    event_date  DATE,                                    -- 活动日期
    event_time  TIME,                                    -- 活动时间
    attendees   INT,                                     -- 参与人数
    status      INT       DEFAULT 0,                     -- 状态(0=待确认,1=已确认,2=已取消)
    notes       TEXT,                                    -- 备注
    del_state   INT       DEFAULT 0,                     -- 删除状态，0=正常，1=已删除
    del_time    TIMESTAMP NULL,                          -- 删除时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- 创建时间
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id),    -- 外键，关联农场表
    FOREIGN KEY (user_id) REFERENCES user_info (user_id) -- 外键，关联用户信息表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 农场公告表 (farm_announcements) **/
DROP TABLE IF EXISTS `farm_announcements`;
CREATE TABLE farm_announcements
(
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,      -- 公告ID - 修正拼写错误
    farm_id         INT          NOT NULL,               -- 关联农场ID - 修正为INT类型
    title           VARCHAR(128) NOT NULL,               -- 公告标题
    content         TEXT,                                -- 公告内容
    publish_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 发布时间
    end_time        TIMESTAMP,                           -- 结束时间
    is_important    BOOLEAN   DEFAULT FALSE,             -- 是否重要
    status          INT       DEFAULT 1,                 -- 状态(1=显示,0=隐藏)
    del_state       INT       DEFAULT 0,                 -- 删除状态，0=正常，1=已删除
    del_time        TIMESTAMP NULL,                      -- 删除时间
    create_time     TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id)     -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS `farm_work_logs`;
CREATE TABLE farm_work_logs
(
    log_id      INT AUTO_INCREMENT PRIMARY KEY,            -- 日志ID
    farm_id     INT NOT NULL,                              -- 关联农场ID - 修正为INT类型
    unit_id     INT,                                       -- 关联农场单元ID - 修正为INT类型
    work_type   INT,                                       -- 工作类型(1=种植,2=养护,3=收获等)
    title       VARCHAR(128),                              -- 日志标题
    description TEXT,                                      -- 日志描述
    worker_id   INT,                                       -- 操作人员ID - 修正为INT类型
    weather     VARCHAR(50),                               -- 天气情况
    temperature VARCHAR(20),                               -- 温度
    image_urls  JSON,                                      -- 图片列表
    work_date   DATE,                                      -- 工作日期
    del_state   INT       DEFAULT 0,                       -- 删除状态，0=正常，1=已删除
    del_time    TIMESTAMP NULL,                            -- 删除时间
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,       -- 创建时间
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id),      -- 外键，关联农场表
    FOREIGN KEY (unit_id) REFERENCES farm_units (unit_id), -- 外键，关联农场单元表
    FOREIGN KEY (worker_id) REFERENCES user_info (user_id) -- 外键，关联用户信息表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

/** 农场设备表 (farm_equipment) **/
DROP TABLE IF EXISTS `farm_equipment`;
CREATE TABLE farm_equipment
(
    equipment_id   INT AUTO_INCREMENT PRIMARY KEY,      -- 设备ID - 修正拼写错误
    farm_id        INT          NOT NULL,               -- 关联农场ID - 修正为INT类型
    name           VARCHAR(128) NOT NULL,               -- 设备名称
    equipment_type INT,                                 -- 设备类型
    description    TEXT,                                -- 设备描述
    purchase_date  DATE,                                -- 购买日期
    status         INT       DEFAULT 1,                 -- 状态(1=正常,0=维修中)
    last_check     DATE,                                -- 最后检查日期
    del_state      INT       DEFAULT 0,                 -- 删除状态，0=正常，1=已删除
    del_time       TIMESTAMP NULL,                      -- 删除时间
    create_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id)    -- 外键，关联农场表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;


/** 农场资讯文章表 (farm_articles) **/
DROP TABLE IF EXISTS `farm_articles`;
CREATE TABLE farm_articles
(
    article_id   INT AUTO_INCREMENT PRIMARY KEY,           -- 文章ID - 修正拼写错误
    farm_id      INT          NOT NULL,                    -- 关联农场ID - 修正为INT类型
    title        VARCHAR(128) NOT NULL,                    -- 文章标题
    content      TEXT,                                     -- 文章内容
    author_id    INT,                                      -- 作者ID - 修正为INT类型
    cover_image  VARCHAR(512),                             -- 封面图片
    publish_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- 发布时间
    view_count   INT       DEFAULT 0,                      -- 浏览次数
    status       INT       DEFAULT 1,                      -- 状态(1=已发布,0=草稿)
    tags         JSON,                                     -- 标签，JSON格式
    del_state    INT       DEFAULT 0,                      -- 删除状态，0=正常，1=已删除
    del_time     TIMESTAMP NULL,                           -- 删除时间
    create_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- 创建时间
    FOREIGN KEY (farm_id) REFERENCES farms (farm_id),      -- 外键，关联农场表
    FOREIGN KEY (author_id) REFERENCES user_info (user_id) -- 外键，关联用户信息表
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci
ROW_FORMAT = Dynamic;

