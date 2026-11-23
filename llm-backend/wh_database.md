<!-- 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-19 | 大模型：Tencent Hunyuan Hy -->

# 数据库变更记录（一律追加写入，禁止覆盖已有内容）

暂无建表、改表或数据插入记录。

## 2026-11-19 初始化科技新闻表 wh_news
> 按 AGENTS.md 规则，数据库表名及字段相关命名统一加 `wh_` 前缀；以下字段依次对应题目要求的 id、title、summary、content、source、publish_time、cover_img。按执行顺序执行即可完整重建数据库。

```sql
CREATE DATABASE IF NOT EXISTS wh_course_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wh_course_db;

CREATE TABLE IF NOT EXISTS wh_news (
  wh_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  wh_title VARCHAR(200) NOT NULL COMMENT '标题',
  wh_summary VARCHAR(500) NOT NULL COMMENT '摘要',
  wh_content TEXT NOT NULL COMMENT '正文',
  wh_source VARCHAR(100) NOT NULL COMMENT '来源',
  wh_publish_time DATETIME NOT NULL COMMENT '发布时间',
  wh_cover_img VARCHAR(255) NOT NULL DEFAULT '' COMMENT '封面图路径',
  PRIMARY KEY (wh_id),
  KEY wh_idx_news_publish_time (wh_publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科技新闻表';

DELETE FROM wh_news;

INSERT INTO wh_news (wh_title, wh_summary, wh_content, wh_source, wh_publish_time, wh_cover_img) VALUES ('OpenAI 发布 GPT-4 多模态大模型', 'OpenAI 推出 GPT-4，支持文本与图像输入，在多项基准测试中表现显著提升。', '2023 年 3 月 14 日，OpenAI 正式发布 GPT-4。该模型可接受文本与图像输入，在律师资格考试、SAT 等测试中取得远高于 GPT-3.5 的成绩，并率先在 ChatGPT Plus 中开放。', 'OpenAI', '2023-03-14 20:00:00', '/images/news_gpt4.jpg');

INSERT INTO wh_news (wh_title, wh_summary, wh_content, wh_source, wh_publish_time, wh_cover_img) VALUES ('OpenAI 公布视频生成模型 Sora', 'Sora 可根据文本生成长达一分钟的高清视频，模拟真实世界运动与镜头语言。', '2024 年 2 月 15 日，OpenAI 发布 Sora 预览版。该模型基于扩散与 Transformer 架构，能够依据自然语言描述生成 1080p、最长 60 秒的视频，并支持多镜头连续叙事。', 'OpenAI', '2024-02-15 22:00:00', '/images/news_sora.jpg');

INSERT INTO wh_news (wh_title, wh_summary, wh_content, wh_source, wh_publish_time, wh_cover_img) VALUES ('小米汽车 SU7 正式上市', '小米首款轿车 SU7 发布，提供标准版、Pro 版和 Max 版，售价 21.59 万元起。', '2024 年 3 月 28 日，小米在北京举行发布会，正式推出首款车型小米 SU7。新车定位 C 级高性能轿跑，Max 版零百加速 2.78 秒，CLTC 续航最高 800 公里。', '小米公司', '2024-03-28 19:30:00', '/images/news_su7.jpg');

INSERT INTO wh_news (wh_title, wh_summary, wh_content, wh_source, wh_publish_time, wh_cover_img) VALUES ('华为发布 Pura 70 系列手机', '华为 Pura 70 系列亮相，搭载麒麟芯片与超聚光影像系统，主打拍照与卫星通信。', '2024 年 4 月 25 日，华为消费者业务发布 Pura 70 系列。该系列包含 Pura 70、70 Pro、70 Pro+ 与 70 Ultra，首次以 Pura 命名，主摄支持物理可变光圈。', '华为消费者业务', '2024-04-25 14:00:00', '/images/news_pura70.jpg');

INSERT INTO wh_news (wh_title, wh_summary, wh_content, wh_source, wh_publish_time, wh_cover_img) VALUES ('OpenAI 推出 GPT-4o 原生多模态模型', 'GPT-4o 实现文本、音频与视觉的端到端统一处理，语音响应延迟低至 232 毫秒。', '2024 年 5 月 13 日，OpenAI 发布 GPT-4o。模型可在 232 毫秒内对语音输入作出回应，接近人类对话节奏，并同时理解文本、音频与画面，免费向 ChatGPT 用户开放部分能力。', 'OpenAI', '2024-05-13 21:00:00', '/images/news_gpt4o.jpg');

INSERT INTO wh_news (wh_title, wh_summary, wh_content, wh_source, wh_publish_time, wh_cover_img) VALUES ('火山引擎发布豆包大模型', '字节跳动旗下豆包大模型正式对外，覆盖对话、创作与多模态场景，定价低于行业均值。', '2024 年 5 月 15 日，字节跳动在火山引擎 FORCE 原动力大会上发布豆包大模型。该模型支持 128K 上下文，提供通用、角色扮演、视觉理解等版本，并以较低 token 单价面向企业开放。', '火山引擎', '2024-05-15 10:00:00', '/images/news_doubao.jpg');

INSERT INTO wh_news (wh_title, wh_summary, wh_content, wh_source, wh_publish_time, wh_cover_img) VALUES ('苹果发布 Apple Intelligence', '苹果在 WWDC 2024 公布个人智能系统，深度集成大模型能力，覆盖 iOS、iPadOS 与 macOS。', '2024 年 6 月 10 日，苹果在 WWDC 2024 上发布 Apple Intelligence。该系统结合端侧与云端模型，提供写作辅助、图像生成与智能通知摘要，并支持 Siri 更自然的语义理解。', 'Apple Newsroom', '2024-06-10 21:00:00', '/images/news_apple_intel.jpg');

INSERT INTO wh_news (wh_title, wh_summary, wh_content, wh_source, wh_publish_time, wh_cover_img) VALUES ('深度求索发布 DeepSeek-R1 推理模型', 'DeepSeek-R1 采用强化学习训练，在数学与代码推理任务上达到主流闭源模型水平并开源权重。', '2025 年 1 月 20 日，深度求索发布 DeepSeek-R1。该模型通过大规模强化学习激发推理能力，在 AIME、MATH 等基准上表现突出，并以 MIT 许可证开放模型权重与蒸馏版本。', 'DeepSeek', '2025-01-20 09:00:00', '/images/news_deepseek_r1.jpg');
```

## 2026-11-19 初始化图文表 wh_gallery
> 按 AGENTS.md 规则，字段统一加 `wh_` 前缀；以下字段依次对应题目要求的 id、title、description、img_url、category、create_time。紧接上一段 SQL 执行即可完整重建数据库。

```sql
USE wh_course_db;

CREATE TABLE IF NOT EXISTS wh_gallery (
  wh_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  wh_title VARCHAR(200) NOT NULL COMMENT '标题',
  wh_description VARCHAR(500) NOT NULL COMMENT '描述',
  wh_img_url VARCHAR(255) NOT NULL COMMENT '图片地址',
  wh_category VARCHAR(100) NOT NULL COMMENT '分类',
  wh_create_time DATETIME NOT NULL COMMENT '创建时间',
  PRIMARY KEY (wh_id),
  KEY wh_idx_gallery_create_time (wh_create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图文画廊表';

DELETE FROM wh_gallery;

INSERT INTO wh_gallery (wh_title, wh_description, wh_img_url, wh_category, wh_create_time) VALUES ('大模型推理芯片', '面向 Transformer 负载的 NPU 架构，强调高带宽内存与低延迟互联。', '/images/gallery_chip.jpg', '硬件', '2025-02-12 10:30:00');

INSERT INTO wh_gallery (wh_title, wh_description, wh_img_url, wh_category, wh_create_time) VALUES ('具身智能机器人', '视觉-语言-动作模型驱动的服务机器人，可在家庭场景完成抓取与整理。', '/images/gallery_robot.jpg', '人工智能', '2025-03-08 09:15:00');

INSERT INTO wh_gallery (wh_title, wh_description, wh_img_url, wh_category, wh_create_time) VALUES ('低轨卫星互联网', '批量组网通信卫星，为偏远地区提供低时延宽带接入。', '/images/gallery_satellite.jpg', '通信', '2025-04-21 14:00:00');

INSERT INTO wh_gallery (wh_title, wh_description, wh_img_url, wh_category, wh_create_time) VALUES ('开源操作系统生态', '面向边缘设备的轻量系统，支持容器化部署与统一设备管理。', '/images/gallery_os.jpg', '软件', '2025-05-17 16:45:00');

INSERT INTO wh_gallery (wh_title, wh_description, wh_img_url, wh_category, wh_create_time) VALUES ('固态电池量产线', '新一代动力电池中试线，能量密度与快充循环寿命同步提升。', '/images/gallery_battery.jpg', '新能源', '2025-06-05 11:20:00');

INSERT INTO wh_gallery (wh_title, wh_description, wh_img_url, wh_category, wh_create_time) VALUES ('扩展现实头显', '轻量化 XR 设备，采用 pancake 光学与眼动追踪实现自然交互。', '/images/gallery_xr.jpg', '消费电子', '2025-07-19 20:10:00');

INSERT INTO wh_gallery (wh_title, wh_description, wh_img_url, wh_category, wh_create_time) VALUES ('智能驾驶域控制器', '中央计算架构下的域控平台，支持多传感器融合与实时路径规划。', '/images/gallery_autodrive.jpg', '汽车', '2025-08-26 13:05:00');

INSERT INTO wh_gallery (wh_title, wh_description, wh_img_url, wh_category, wh_create_time) VALUES ('量子计算原型机', '超导量子处理器实现更高保真度双比特门，面向云端量子算法验证。', '/images/gallery_quantum.jpg', '前沿研究', '2025-10-11 08:40:00');
```

## 2026-11-19 修正 wh_gallery 图片路径为本地 SVG
> 原始 INSERT 中的 `.jpg` 文件并不存在，导致页面触发图片失败占位。以下 UPDATE 紧接上一段 SQL 执行，最终图片路径指向 `frontend/images/` 中真实存在的本地 SVG 文件。

```sql
USE wh_course_db;

UPDATE wh_gallery SET wh_img_url = '/images/gallery_chip.svg' WHERE wh_id = 1;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_robot.svg' WHERE wh_id = 2;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_satellite.svg' WHERE wh_id = 3;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_os.svg' WHERE wh_id = 4;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_battery.svg' WHERE wh_id = 5;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_xr.svg' WHERE wh_id = 6;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_autodrive.svg' WHERE wh_id = 7;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_quantum.svg' WHERE wh_id = 8;
```

## 2026-11-19 将 wh_gallery 图片替换为真实照片
> 应用上一段 SVG 修正后，再将图片升级为真实 JPG 照片。照片文件已下载到 `frontend/images/`，以下 UPDATE 紧接执行，最终数据库路径指向本地真实照片。

```sql
USE wh_course_db;

UPDATE wh_gallery SET wh_img_url = '/images/gallery_chip.jpg' WHERE wh_id = 1;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_robot.jpg' WHERE wh_id = 2;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_satellite.jpg' WHERE wh_id = 3;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_os.jpg' WHERE wh_id = 4;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_battery.jpg' WHERE wh_id = 5;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_xr.jpg' WHERE wh_id = 6;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_autodrive.jpg' WHERE wh_id = 7;
UPDATE wh_gallery SET wh_img_url = '/images/gallery_quantum.jpg' WHERE wh_id = 8;
```

## 2026-11-23 新增知识库表 wh_kb_file、wh_kb_chunk
> 用于知识库文件上传、解析与 RAG 检索：上传的文件解析为纯文本后按约 180 字切成分片存入 wh_kb_chunk，问答时按关键词重合度召回前 3 个分片。以下 SQL 按顺序执行即可重建；`wh_path` 为上传后的实际存储路径，换机后重新上传即可（删除时物理文件不存在会自动忽略）。测试数据含 2 个格式化知识库文件（docx、pptx）与 6 个 txt 业务资料，共 8 个文件、10 个分片。

```sql
USE wh_course_db;

CREATE TABLE IF NOT EXISTS wh_kb_file (
  wh_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  wh_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  wh_ext VARCHAR(16) NOT NULL COMMENT '扩展名',
  wh_size INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小（字节）',
  wh_path VARCHAR(500) NOT NULL COMMENT '服务器存储路径',
  wh_chunk_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '分片数量',
  wh_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  PRIMARY KEY (wh_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文件表';

CREATE TABLE IF NOT EXISTS wh_kb_chunk (
  wh_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  wh_file_id INT UNSIGNED NOT NULL COMMENT '所属文件 ID',
  wh_file_name VARCHAR(255) NOT NULL COMMENT '所属文件名（冗余，便于检索展示）',
  wh_chunk_index INT UNSIGNED NOT NULL COMMENT '分片序号',
  wh_content TEXT NOT NULL COMMENT '分片文本',
  PRIMARY KEY (wh_id),
  KEY idx_wh_kb_chunk_file (wh_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文本分片表';

DELETE FROM wh_kb_chunk;
DELETE FROM wh_kb_file;

INSERT INTO wh_kb_file (wh_id, wh_name, wh_ext, wh_size, wh_path, wh_chunk_count) VALUES (1, 'wh_kb_会员活动.txt', '.txt', 106, 'backend/uploads/kb/wh_kb_会员活动.txt', 1);
INSERT INTO wh_kb_file (wh_id, wh_name, wh_ext, wh_size, wh_path, wh_chunk_count) VALUES (2, 'wh_kb_停车说明.txt', '.txt', 129, 'backend/uploads/kb/wh_kb_停车说明.txt', 1);
INSERT INTO wh_kb_file (wh_id, wh_name, wh_ext, wh_size, wh_path, wh_chunk_count) VALUES (3, 'wh_kb_发票说明.txt', '.txt', 136, 'backend/uploads/kb/wh_kb_发票说明.txt', 1);
INSERT INTO wh_kb_file (wh_id, wh_name, wh_ext, wh_size, wh_path, wh_chunk_count) VALUES (4, 'wh_kb_外卖配送.txt', '.txt', 141, 'backend/uploads/kb/wh_kb_外卖配送.txt', 1);
INSERT INTO wh_kb_file (wh_id, wh_name, wh_ext, wh_size, wh_path, wh_chunk_count) VALUES (5, 'wh_kb_招牌菜介绍.pptx', '.pptx', 3672, 'backend/uploads/kb/wh_kb_招牌菜介绍.pptx', 2);
INSERT INTO wh_kb_file (wh_id, wh_name, wh_ext, wh_size, wh_path, wh_chunk_count) VALUES (6, 'wh_kb_支付方式.txt', '.txt', 109, 'backend/uploads/kb/wh_kb_支付方式.txt', 1);
INSERT INTO wh_kb_file (wh_id, wh_name, wh_ext, wh_size, wh_path, wh_chunk_count) VALUES (7, 'wh_kb_营业手册.docx', '.docx', 2443, 'backend/uploads/kb/wh_kb_营业手册.docx', 2);
INSERT INTO wh_kb_file (wh_id, wh_name, wh_ext, wh_size, wh_path, wh_chunk_count) VALUES (8, 'wh_kb_订座规则.txt', '.txt', 112, 'backend/uploads/kb/wh_kb_订座规则.txt', 1);

INSERT INTO wh_kb_chunk (wh_file_id, wh_file_name, wh_chunk_index, wh_content) VALUES (1, 'wh_kb_会员活动.txt', 0, '中华美食街会员活动\n充值 300 元赠送 30 元，会员生日当天赠送一碗红糖冰粉。');
INSERT INTO wh_kb_chunk (wh_file_id, wh_file_name, wh_chunk_index, wh_content) VALUES (2, 'wh_kb_停车说明.txt', 0, '中华美食街停车说明\n地下停车场 B 区，消费满 100 元可免费停车 2 小时，超出部分每小时 5 元。');
INSERT INTO wh_kb_chunk (wh_file_id, wh_file_name, wh_chunk_index, wh_content) VALUES (3, 'wh_kb_发票说明.txt', 0, '中华美食街发票说明\n支持开具电子发票，结账后联系客服小七登记开票信息，48 小时内发送至邮箱。');
INSERT INTO wh_kb_chunk (wh_file_id, wh_file_name, wh_chunk_index, wh_content) VALUES (4, 'wh_kb_外卖配送.txt', 0, '中华美食街外卖配送规则\n配送范围为门店周边 3 公里，满 30 元起送，配送费 5 元，预计 30-45 分钟送达。');
INSERT INTO wh_kb_chunk (wh_file_id, wh_file_name, wh_chunk_index, wh_content) VALUES (5, 'wh_kb_招牌菜介绍.pptx', 0, '中华美食街招牌菜介绍\n麻辣小龙虾：88 元/份，中辣可调，每日限量 50 份。\n炭火烤串：羊肉串 5 元/串，鸡翅 8 元/串，供应至 22:00。\n手工酸辣粉：18 元/碗，可选微辣、中辣、特辣。\n招牌甜品：红糖冰粉 10 元/碗。\n配送规则：门店周边 3 公里内，满 30 元起送，配送费 5 元。\n营业时间：每天 10:00-22:00，节假日照常营业。');
INSERT INTO wh_kb_chunk (wh_file_id, wh_file_name, wh_chunk_index, wh_content) VALUES (5, 'wh_kb_招牌菜介绍.pptx', 1, '停车优惠：消费满 100 元免 2 小时停车费。\n会员活动：充值 300 元赠送 30 元。');
INSERT INTO wh_kb_chunk (wh_file_id, wh_file_name, wh_chunk_index, wh_content) VALUES (6, 'wh_kb_支付方式.txt', 0, '中华美食街支付方式\n门店支持微信、支付宝和现金支付，暂不支持银行卡刷卡。');
INSERT INTO wh_kb_chunk (wh_file_id, wh_file_name, wh_chunk_index, wh_content) VALUES (7, 'wh_kb_营业手册.docx', 0, '中华美食街营业手册\n一、营业时间：每天 10:00-22:00，节假日照常营业，21:30 停止点餐。\n二、招牌菜：麻辣小龙虾 88 元/份；炭火烤串（羊肉串 5 元/串，鸡翅 8 元/串）；手工酸辣粉 18 元/碗。\n三、配送范围：门店周边 3 公里内，满 30 元起送，配送费 5 元，预计 30-45 分钟送达。');
INSERT INTO wh_kb_chunk (wh_file_id, wh_file_name, wh_chunk_index, wh_content) VALUES (7, 'wh_kb_营业手册.docx', 1, '四、支付方式：支持微信、支付宝和现金支付。\n五、停车信息：地下停车场 B 区，消费满 100 元可免费停车 2 小时。\n六、发票说明：可开具电子发票，请联系客服小七登记。\n七、订座规则：6 人以上可电话预订，座位保留 15 分钟。\n八、优惠活动：工作日午市满 50 元减 10 元。');
INSERT INTO wh_kb_chunk (wh_file_id, wh_file_name, wh_chunk_index, wh_content) VALUES (8, 'wh_kb_订座规则.txt', 0, '中华美食街订座规则\n6 人以上可电话预订座位，座位保留 15 分钟，超时自动释放。');
```
