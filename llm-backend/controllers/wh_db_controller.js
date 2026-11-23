/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-19 | 大模型：Tencent Hunyuan Hy
 */
const whDbModel = require('../models/wh_db_model');

function whGetDefaults(whReq, whRes) {
  const whData = {
    username: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || ''
  };

  console.log('[wh_api] 返回数据库默认凭据配置');
  whRes.json({ code: 0, msg: '默认凭据获取成功', data: whData });
}

async function whPostConnect(whReq, whRes) {
  const whUsername = whReq.body && whReq.body.username;
  const whPassword = whReq.body && whReq.body.password;

  if (!whUsername || !whPassword) {
    return whRes.json({ code: 1, msg: '用户名和密码不能为空', data: {} });
  }

  try {
    const whVersion = await whDbModel.whTestConnection(whUsername, whPassword);
    whRes.json({
      code: 0,
      msg: '数据库连接成功',
      data: {
        host: process.env.DB_HOST || 'localhost',
        version: whVersion,
        db_version: whVersion
      }
    });
  } catch (whError) {
    console.error('[wh_api] 数据库连接失败：', whError.message);
    whRes.json({ code: 1, msg: `数据库连接失败：${whError.message}`, data: {} });
  }
}

module.exports = { whGetDefaults, whPostConnect };
