/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-19 | 大模型：Tencent Hunyuan Hy
 */
const whNewsModel = require('../models/wh_news_model');

async function whGetNews(whReq, whRes) {
  try {
    const whNewsList = await whNewsModel.whGetAllNews();
    whRes.json({
      code: 0,
      msg: '新闻列表获取成功',
      data: {
        list: whNewsList,
        total: whNewsList.length
      }
    });
  } catch (whError) {
    console.error('[wh_api] 新闻列表获取失败：', whError.message);
    whRes.json({ code: 1, msg: `新闻列表获取失败：${whError.message}`, data: {} });
  }
}

module.exports = { whGetNews };
