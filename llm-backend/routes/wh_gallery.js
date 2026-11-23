/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-19 | 大模型：Tencent Hunyuan Hy
 */
const express = require('express');
const whGalleryController = require('../controllers/wh_gallery_controller');

const whRouter = express.Router();

whRouter.get('/gallery', whGalleryController.whGetGallery);

module.exports = whRouter;
