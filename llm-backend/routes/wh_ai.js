/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const express = require('express');
const whAIController = require('../controllers/wh_ai_controller');

const whRouter = express.Router();

whRouter.post('/ai/chat', whAIController.whChat);
whRouter.post('/ai/chat/stream', whAIController.whChatStream);

module.exports = whRouter;
