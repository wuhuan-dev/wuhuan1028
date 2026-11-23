/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-19 | 大模型：Tencent Hunyuan Hy
 */
const whDbPool = require('../config/wh_db');

function whMapNewsRow(whRow) {
  return {
    id: whRow.wh_id,
    title: whRow.wh_title,
    summary: whRow.wh_summary,
    content: whRow.wh_content,
    source: whRow.wh_source,
    publish_time: whRow.wh_publish_time_text,
    cover_img: whRow.wh_cover_img
  };
}

async function whGetAllNews() {
  const [whRows] = await whDbPool.execute(
    'SELECT wh_id, wh_title, wh_summary, wh_content, wh_source, wh_cover_img, DATE_FORMAT(wh_publish_time, \'%Y-%m-%d %H:%i:%s\') AS wh_publish_time_text FROM wh_news ORDER BY wh_publish_time DESC'
  );

  return whRows.map(whMapNewsRow);
}

module.exports = { whGetAllNews };
