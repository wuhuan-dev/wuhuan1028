/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-19 | 大模型：Tencent Hunyuan Hy
 */
const whDbPool = require('../config/wh_db');

function whMapGalleryRow(whRow) {
  return {
    id: whRow.wh_id,
    title: whRow.wh_title,
    description: whRow.wh_description,
    img_url: whRow.wh_img_url,
    category: whRow.wh_category,
    create_time: whRow.wh_create_time_text
  };
}

async function whGetAllGallery() {
  const [whRows] = await whDbPool.execute(
    'SELECT wh_id, wh_title, wh_description, wh_img_url, wh_category, DATE_FORMAT(wh_create_time, \'%Y-%m-%d %H:%i:%s\') AS wh_create_time_text FROM wh_gallery ORDER BY wh_create_time DESC'
  );

  return whRows.map(whMapGalleryRow);
}

module.exports = { whGetAllGallery };
