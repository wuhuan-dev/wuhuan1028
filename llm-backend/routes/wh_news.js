/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-19 | 大模型：Tencent Hunyuan Hy
 */
const express = require('express');
const whNewsController = require('../controllers/wh_news_controller');

const whRouter = express.Router();

whRouter.get('/news', whNewsController.whGetNews);

module.exports = whRouter;
