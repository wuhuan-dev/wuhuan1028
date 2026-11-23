/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const express = require('express');
const whKefuController = require('../controllers/wh_kefu_controller');

const whRouter = express.Router();

whRouter.post('/kefu/chat', whKefuController.whKefuChat);
whRouter.post('/kefu/chat/stream', whKefuController.whKefuChatStream);

module.exports = whRouter;
