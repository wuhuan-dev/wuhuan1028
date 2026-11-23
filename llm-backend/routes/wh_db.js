/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-19 | 大模型：Tencent Hunyuan Hy
 */
const express = require('express');
const whDbController = require('../controllers/wh_db_controller');

const whRouter = express.Router();

whRouter.get('/db/defaults', whDbController.whGetDefaults);
whRouter.post('/db/connect', whDbController.whPostConnect);
whRouter.post('/db-test', whDbController.whPostConnect);

module.exports = whRouter;
