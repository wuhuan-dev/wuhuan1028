/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const express = require('express');
const whAsrController = require('../controllers/wh_asr_controller');

const whRouter = express.Router();

whRouter.post('/asr/transcribe', whAsrController.whUploadMiddleware, whAsrController.whTranscribe);

module.exports = whRouter;
