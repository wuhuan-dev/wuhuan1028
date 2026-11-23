/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-19 | 大模型：Tencent Hunyuan Hy
 */
const mysql = require('mysql2/promise');

async function whTestConnection(whUsername, whPassword) {
  const whConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: whUsername,
    password: whPassword
  });

  try {
    const [whRows] = await whConnection.execute('SELECT VERSION() AS wh_version');
    return whRows[0].wh_version;
  } finally {
    await whConnection.end();
  }
}

module.exports = { whTestConnection };
