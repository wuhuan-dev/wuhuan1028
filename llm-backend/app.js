/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-19 | 大模型：Tencent Hunyuan Hy
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const whDbRouter = require('./routes/wh_db');
const whNewsRouter = require('./routes/wh_news');
const whGalleryRouter = require('./routes/wh_gallery');
const whAIRouter = require('./routes/wh_ai');
const whKefuRouter = require('./routes/wh_kefu');
const whKbRouter = require('./routes/wh_kb');
const whVisionRouter = require('./routes/wh_vision');
const whAsrRouter = require('./routes/wh_asr');

const whApp = express();

whApp.use(cors());
whApp.use(express.json());
whApp.use('/api', whDbRouter);
whApp.use('/api', whNewsRouter);
whApp.use('/api', whGalleryRouter);
whApp.use('/api', whAIRouter);
whApp.use('/api', whKefuRouter);
whApp.use('/api', whKbRouter);
whApp.use('/api', whVisionRouter);
whApp.use('/api', whAsrRouter);
whApp.use(express.static(path.join(__dirname, '..', 'llm')));

const whPort = 8028;

whApp.listen(whPort, () => {
  console.log(`[wh_server] 服务已启动：http://localhost:${whPort}`);
});
