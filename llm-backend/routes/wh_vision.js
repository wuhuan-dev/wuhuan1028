/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const express = require('express');
const whVisionController = require('../controllers/wh_vision_controller');

const whRouter = express.Router();

whRouter.post('/vision/describe', whVisionController.whUploadMiddleware, whVisionController.whDescribe);

module.exports = whRouter;
