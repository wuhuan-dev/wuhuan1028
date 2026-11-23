/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-19 | 大模型：Tencent Hunyuan Hy
 */
const whGalleryModel = require('../models/wh_gallery_model');

async function whGetGallery(whReq, whRes) {
  try {
    const whGalleryList = await whGalleryModel.whGetAllGallery();
    whRes.json({
      code: 0,
      msg: '图文列表获取成功',
      data: {
        list: whGalleryList,
        total: whGalleryList.length
      }
    });
  } catch (whError) {
    console.error('[wh_api] 图文列表获取失败：', whError.message);
    whRes.json({ code: 1, msg: `图文列表获取失败：${whError.message}`, data: {} });
  }
}

module.exports = { whGetGallery };
