<!-- 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-19 | 大模型：Tencent Hunyuan Hy -->

# 接口记录（一律追加写入，禁止覆盖已有内容）

暂无接口创建或修改记录。

2026-11-19 | 接口路径：/api/db/defaults | HTTP 方法：GET | 请求参数：无（示例：GET /api/db/defaults） | 响应格式：{ "code": 0, "msg": "默认凭据获取成功", "data": { "username": "<来自 backend/.env>", "password": "<来自 backend/.env>" } } | 修改时间：2026-11-19

2026-11-19 | 接口路径：/api/db/connect | HTTP 方法：POST | 请求参数（JSON Body）：{ "username": "root", "password": "your_password" } | 响应格式：成功 { "code": 0, "msg": "数据库连接成功", "data": { "host": "localhost", "version": "8.0.36" } }；失败 { "code": 1, "msg": "数据库连接失败：<错误原因>", "data": {} } | 修改时间：2026-11-19

2026-11-19 | 接口路径：/api/news | HTTP 方法：GET | 请求参数：无（示例：GET /api/news） | 响应格式：成功 { "code": 0, "msg": "新闻列表获取成功", "data": { "total": 8, "list": [ { "id": 8, "title": "深度求索发布 DeepSeek-R1 推理模型", "summary": "DeepSeek-R1 采用强化学习训练，在数学与代码推理任务上达到主流闭源模型水平并开源权重。", "content": "2025 年 1 月 20 日，深度求索发布 DeepSeek-R1。", "source": "DeepSeek", "publish_time": "2025-01-20 09:00:00", "cover_img": "/images/news_deepseek_r1.jpg" } ] } }；失败 { "code": 1, "msg": "新闻列表获取失败：<错误原因>", "data": {} } | 修改时间：2026-11-19

2026-11-19 | 接口路径：/api/gallery | HTTP 方法：GET | 请求参数：无（示例：GET /api/gallery） | 响应格式：成功 { "code": 0, "msg": "图文列表获取成功", "data": { "total": 8, "list": [ { "id": 8, "title": "量子计算原型机", "description": "超导量子处理器实现更高保真度双比特门，面向云端量子算法验证。", "img_url": "/images/gallery_quantum.jpg", "category": "前沿研究", "create_time": "2025-10-11 08:40:00" } ] } }；失败 { "code": 1, "msg": "图文列表获取失败：<错误原因>", "data": {} } | 修改时间：2026-11-19

2026-11-19 | 接口路径：/api/db-test | HTTP 方法：POST | 请求参数（JSON Body）：{ "username": "root", "password": "<来自 backend/.env>" }（示例：{ "username": "root", "password": "your_password" }） | 响应格式：成功 { "code": 0, "msg": "数据库连接成功", "data": { "host": "localhost", "version": "8.0.43", "db_version": "8.0.43" } }；失败 { "code": 1, "msg": "数据库连接失败：<错误原因>", "data": {} } | 修改时间：2026-11-19

2026-11-20 | 接口路径：/api/ai/chat | HTTP 方法：POST | 请求参数（JSON Body）：{ "whQuestion": "预算10万买什么车好？" } | 响应格式：成功 { "code": 0, "msg": "AI 问答成功", "data": { "answer": "💰 不同预算购车推荐：...", "category": "选车指南", "matched": true, "question": "预算10万买什么车好？" } }；失败 { "code": 1, "msg": "AI 问答失败：<错误原因>", "data": {} } | 修改时间：2026-11-20

2026-11-20 | 接口路径：/api/ai/chat/stream | HTTP 方法：POST | 请求参数（JSON Body）：{ "whQuestion": "油车还是电车？" } | 响应格式：SSE 流式推送 Content-Type: text/event-stream，帧格式 data: {JSON}\n\n，依次推送 meta / chunk × N / done / [DONE] | 修改时间：2026-11-20

2026-11-20 | 接口路径：/api/ai/compare | HTTP 方法：POST | 请求参数（JSON Body）：{ "whCarA": "Model 3", "whCarB": "秦PLUS" } | 响应格式：成功 { "code": 0, "msg": "对比成功", "data": { "whCarA": {...车型详情}, "whCarB": {...车型详情}, "whAdvice": "📊 Model 3 vs 秦PLUS 选购建议..." } }；失败 { "code": 1, "msg": "未找到匹配的车型...", "data": {} } | 修改时间：2026-11-20

2026-11-20 | 接口路径：/api/ai/hot-questions | HTTP 方法：GET | 请求参数：无（示例：GET /api/ai/hot-questions） | 响应格式：{ "code": 0, "msg": "热门问题获取成功", "data": { "total": 6, "list": ["预算 5 万买什么车好？", "油车和电车怎么选？", ...] } } | 修改时间：2026-11-20

2026-11-20 | 接口路径：/api/ai/cars | HTTP 方法：GET | 请求参数：无（示例：GET /api/ai/cars） | 响应格式：{ "code": 0, "msg": "车型列表获取成功", "data": { "total": 8, "list": [{ "name": "特斯拉 Model 3", "brand": "特斯拉", "price": "24.59-33.19 万", "type": "纯电动轿车" }, ...] } } | 修改时间：2026-11-20

2026-11-20 | 接口路径：/api/ai/summary | HTTP 方法：POST | 请求参数（JSON Body）：{ "whTopic": "二手车避坑" } 或 { "whText": "要摘要的文本内容..." } | 响应格式：成功 { "code": 0, "msg": "摘要生成成功", "data": { "summary": "🔍 二手车避坑指南...", "sourceLength": 6 } }；失败 { "code": 1, "msg": "请提供 whText 或 whTopic", "data": {} } | 修改时间：2026-11-20

2026-11-20 | AI 车主管家相关接口已全部下线：/api/ai/chat、/api/ai/chat/stream、/api/ai/compare、/api/ai/hot-questions、/api/ai/cars、/api/ai/summary 均已删除；以上历史记录仅作追溯，接口不再可用。 | 修改时间：2026-11-20

2026-11-23 | 接口路径：/api/ai/chat | HTTP 方法：POST | 请求参数（JSON Body）：{ "whMessages": [ { "role": "user", "content": "用三句话介绍你自己" } ] }（role 仅支持 user / assistant，单条内容不超过 4000 字符，最多取最近 20 条；示例：{ "whMessages": [{ "role": "user", "content": "你好" }] }） | 响应格式：成功 { "code": 0, "msg": "AI 回复成功", "data": { "answer": "我是……", "model": "Qwen/Qwen2.5-7B-Instruct", "usage": { "prompt_tokens": 33, "completion_tokens": 60, "total_tokens": 93 } } }；参数错误 { "code": 1, "msg": "请提供 whMessages 数组，且至少包含一条用户消息", "data": {} }；调用失败 { "code": 1, "msg": "AI 问答失败：<错误原因>", "data": {} } | 修改时间：2026-11-23

2026-11-23 | 接口路径：/api/ai/chat/stream | HTTP 方法：POST | 请求参数（JSON Body）：{ "whMessages": [ { "role": "user", "content": "什么是 RESTful API" } ] }（支持携带多轮历史，前端把完整对话数组传回；示例同上） | 响应格式：成功 Content-Type: text/event-stream，帧格式 data: {JSON}\n\n，依次推送 { "type": "meta", "model": "Qwen/Qwen2.5-7B-Instruct" } → { "type": "chunk", "content": "增量文本" } × N → { "type": "done", "model": "...", "answer": "完整回答" } → data: [DONE]；失败（已发送响应头）{ "type": "error", "msg": "AI 问答失败：<错误原因>" } → data: [DONE]；参数错误直接返回 JSON { "code": 1, "msg": "<错误信息>", "data": {} } | 修改时间：2026-11-23

2026-11-23 | /api/ai/chat 与 /api/ai/chat/stream 使用的模型由 backend/.env 的 SILICONFLOW_MODEL 决定，已切换为 deepseek-ai/DeepSeek-V4-Flash（响应中的 model 字段随之变化，其余请求/响应结构不变） | 修改时间：2026-11-23

2026-11-23 | 接口职责收敛为三步：接收前端 messages 数组 → 后端携带 backend/.env 中的 SILICONFLOW_API_KEY 转发给硅基流动 → 把模型回答原样返回给前端（不再注入 system 提示词）。请求字段由 whMessages 更名为 messages，role 支持 system / user / assistant：{ "messages": [ { "role": "system", "content": "你是一个有用的助手" }, { "role": "user", "content": "你好，请介绍一下你自己" } ] }；非流式响应 { "code": 0, "msg": "AI 回复成功", "data": { "answer": "<模型原始回答>", "model": "deepseek-ai/DeepSeek-V4-Flash", "usage": {...} } }；流式仍为 meta → chunk × N → done → [DONE] | 修改时间：2026-11-23

2026-11-23 | 默认模型由 deepseek-ai/DeepSeek-V4-Flash 调整为 deepseek-ai/DeepSeek-V3（V4-Flash 调用长时间无响应）；并为上游调用增加超时保护：非流式 60 秒、流式 90 秒，超时后流式返回 { "type": "error", "msg": "AI 问答失败：AI 响应超时（90 秒），请稍后重试" } → data: [DONE]，非流式返回 code=1 与超时提示 | 修改时间：2026-11-23

2026-11-23 | 接口路径：/api/kefu/chat | HTTP 方法：POST | 请求参数（JSON Body）：{ "messages": [ { "role": "system", "content": "你是一名在线客服……" }, { "role": "user", "content": "我的订单什么时候发货？" } ] }（转发至七牛云 https://api.qnaigc.com/v1，模型 qiniu/conatus-free，Key 来自 backend/.env 的 QINIU_API_KEY；role 支持 system / user / assistant，单条不超过 4000 字符） | 响应格式：成功 { "code": 0, "msg": "客服回复成功", "data": { "answer": "您好……", "model": "qiniu/conatus-free", "usage": {...} } }；参数错误 { "code": 1, "msg": "请提供 messages 数组，且至少包含一条消息", "data": {} }；调用失败 { "code": 1, "msg": "在线客服问答失败：<错误原因>", "data": {} }；免费模型限流时 msg 内含“免费模型请求过多，请稍后重试” | 修改时间：2026-11-23

2026-11-23 | 接口路径：/api/kefu/chat/stream | HTTP 方法：POST | 请求参数（JSON Body）：{ "messages": [ { "role": "system", "content": "你是一名在线客服……" }, { "role": "user", "content": "怎么申请退款？" } ] }（前端携带完整多轮历史） | 响应格式：成功 Content-Type: text/event-stream，帧格式 data: {JSON}\n\n，依次推送 { "type": "meta", "model": "qiniu/conatus-free" } → { "type": "chunk", "content": "增量文本" } × N → { "type": "done", "model": "...", "answer": "完整回答" } → data: [DONE]；失败（已发送响应头）{ "type": "error", "msg": "在线客服问答失败：<错误原因>" } → data: [DONE]；参数错误直接返回 JSON { "code": 1, "msg": "<错误信息>", "data": {} } | 修改时间：2026-11-23

2026-11-23 | /api/kefu/chat 与 /api/kefu/chat/stream 针对免费模型全局限流（HTTP 429，错误码 free_campaign_global_limit）增加自动重试：最多 3 次，间隔 1 秒、2 秒；仍失败则在 msg 中返回“免费模型请求过多，请稍后重试”。上游超时保护：非流式 60 秒、流式 90 秒 | 修改时间：2026-11-23

2026-11-23 | 上游返回 HTTP 401 / 403 时统一转换为友好中文错误：AI 接口为“API Key 无效或已过期，请检查 backend/.env 中的 SILICONFLOW_API_KEY”，客服接口为“……请检查 backend/.env 中的 QINIU_API_KEY”，通过 { code: 1, msg } 或流式 error 帧返回，页面显示为红色错误气泡 | 修改时间：2026-11-23

2026-11-23 | /api/kefu/chat 与 /api/kefu/chat/stream 新增 provider 参数，用于多平台热切换：{ "provider": "siliconflow" | "qiniu", "messages": [...] }，默认 qiniu；siliconflow 读取 SILICONFLOW_API_KEY / SILICONFLOW_BASE_URL / SILICONFLOW_MODEL，qiniu 读取 QINIU_API_KEY / QINIU_BASE_URL / QINIU_MODEL；非法平台返回 { "code": 1, "msg": "不支持的平台：xxx，仅支持 qiniu 或 siliconflow", "data": {} }；流式 meta / done 帧新增 provider 字段：{ "type": "meta", "provider": "qiniu", "model": "qiniu/conatus-free" }；非流式 data 新增 provider。客服人设改为“中华美食街在线客服”，仅回答营业时间、招牌菜、配送范围，其余统一引导留言 | 修改时间：2026-11-23

2026-11-23 | 接口路径：/api/kb/files | HTTP 方法：GET | 请求参数：无 | 响应格式：{ "code": 0, "msg": "知识库文件获取成功", "data": { "total": 8, "list": [ { "id": 7, "name": "wh_kb_营业手册.docx", "ext": ".docx", "size": 2443, "chunkCount": 2, "createTime": "2026-11-23 20:35:54" } ] } }；失败 { "code": 1, "msg": "知识库文件获取失败：<原因>", "data": {} } | 修改时间：2026-11-23

2026-11-23 | 接口路径：/api/kb/files | HTTP 方法：POST | 请求参数：multipart/form-data，字段名 file，支持 .doc / .docx / .ppt / .pptx / .pdf / .txt / .md，单个文件不超过 15MB（.ppt 需转存为 .pptx）；服务端解析文本后按约 180 字切分入库 | 响应格式：成功 { "code": 0, "msg": "知识库文件上传成功", "data": { "id": 9, "name": "说明.txt", "ext": ".txt", "size": 120, "chunkCount": 1 } }；格式不支持或解析失败 { "code": 1, "msg": "文件解析失败：<原因>", "data": {} }；超过大小 { "code": 1, "msg": "文件不能超过 15MB", "data": {} } | 修改时间：2026-11-23

2026-11-23 | 接口路径：/api/kb/files/:id | HTTP 方法：DELETE | 请求参数：路径参数 id（正整数） | 响应格式：成功 { "code": 0, "msg": "知识库文件已删除", "data": { "id": 9 } }；文件不存在 { "code": 1, "msg": "文件不存在或已被删除", "data": {} }；ID 非法 { "code": 1, "msg": "文件 ID 不合法", "data": {} } | 修改时间：2026-11-23

2026-11-23 | 接口路径：/api/kb/chat/stream | HTTP 方法：POST | 请求参数（JSON Body）：{ "provider": "siliconflow", "messages": [ { "role": "user", "content": "你们几点营业？" } ] }（role 仅允许 user / assistant；服务端用最后一条用户消息检索知识库，召回前 3 个分片，拼接 system 提示词后转发给大模型；服务端控制台输出发送给大模型的数据与接收到的每个分片） | 响应格式：SSE，data: {JSON}\n\n，依次推送 { "type": "meta", "provider": "siliconflow", "model": "deepseek-ai/DeepSeek-V3", "retrieved": 2, "sources": ["wh_kb_营业手册.docx"] } → { "type": "chunk", "content": "增量文本" } × N → { "type": "done", "answer": "完整回答", "sources": [...] } → data: [DONE]；知识库未命中时不调用大模型，直接推送固定回答“知识库中暂未找到相关内容……”；失败推送 { "type": "error", "msg": "知识库问答失败：<原因>" } | 修改时间：2026-11-23

2026-11-23 | 接口路径：/api/vision/describe | HTTP 方法：POST | 请求参数：multipart/form-data，字段名 image，支持 jpg / png / webp / gif，单个不超过 10MB；可选字段 prompt 自定义识别要求（最多 500 字），默认“请用简体中文详细描述这张图片的内容、场景和主体，300 字以内”；服务端将图片转为 base64 data URL，使用七牛之外的既有硅基流动 Key 与视觉模型 Qwen/Qwen3-VL-8B-Instruct（backend/.env 的 SILICONFLOW_VISION_MODEL）调用 chat/completions；服务端控制台输出发送给大模型的数据（模型、提示词、图片大小，不输出 base64）与接收到的完整描述 | 响应格式：成功 { "code": 0, "msg": "图像识别成功", "data": { "description": "一张美味的夏威夷风味鸡肉披萨……", "model": "Qwen/Qwen3-VL-8B-Instruct", "usage": {...} } }；未选择图片 { "code": 1, "msg": "请选择要识别的图片（字段名 image）", "data": {} }；格式不支持 { "code": 1, "msg": "上传失败：只支持 jpg、png、webp、gif 格式的图片", "data": {} }；超过大小 { "code": 1, "msg": "上传失败：图片不能超过 10MB", "data": {} }；调用失败 { "code": 1, "msg": "图像识别失败：<原因>", "data": {} } | 修改时间：2026-11-23

2026-11-23 | 接口路径：/api/asr/transcribe | HTTP 方法：POST | 请求参数：multipart/form-data，字段名 audio，支持 wav / mp3 / webm / ogg / m4a 等音频，单个不超过 20MB；服务端以 OpenAI 兼容格式转发到七牛 `POST {QINIU_BASE_URL}/audio/transcriptions`，模型为 `qwen-audio-3.0-asr-flash`（backend/.env 的 QINIU_ASR_MODEL，Key 为 QINIU_API_KEY）；服务端控制台输出发送给大模型的数据（接口、模型、文件名、大小）与接收到的文字和用量 | 响应格式：成功 { "code": 0, "msg": "语音识别成功", "data": { "text": "你好，欢迎光临中华美食街，我们每天10:00-22:00营业。", "model": "qwen-audio-3.0-asr-flash", "usage": { "seconds": 6, "type": "duration" } } }；未选择音频 { "code": 1, "msg": "请选择要识别的音频（字段名 audio）", "data": {} }；非音频文件 { "code": 1, "msg": "只支持音频文件（wav、mp3、webm、ogg、m4a）", "data": {} }；超过大小 { "code": 1, "msg": "上传失败：音频不能超过 20MB", "data": {} }；调用失败 { "code": 1, "msg": "语音识别失败：<原因>", "data": {} } | 修改时间：2026-11-23
