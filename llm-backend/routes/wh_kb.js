/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const express = require('express');
const whKbController = require('../controllers/wh_kb_controller');

const whRouter = express.Router();

whRouter.get('/kb/files', whKbController.whListFiles);
whRouter.post('/kb/files', whKbController.whUploadMiddleware, whKbController.whUploadFile);
whRouter.delete('/kb/files/:id', whKbController.whDeleteFile);
whRouter.post('/kb/chat/stream', whKbController.whKbChatStream);

module.exports = whRouter;
