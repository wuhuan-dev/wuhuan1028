/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const multer = require('multer');
const whVisionModel = require('../models/wh_vision_model');

const WH_ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const WH_DEFAULT_PROMPT = '请用简体中文详细描述这张图片的内容、场景和主体，300 字以内。';

const whUploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function whFilter(whReq, whFile, whCallback) {
    if (!WH_ALLOWED_MIMES.includes(whFile.mimetype)) {
      whCallback(new Error('只支持 jpg、png、webp、gif 格式的图片'));
      return;
    }
    whCallback(null, true);
  }
}).single('image');

function whUploadMiddleware(whReq, whRes, whNext) {
  whUploadSingle(whReq, whRes, function whHandleUpload(whError) {
    if (!whError) {
      whNext();
      return;
    }
    const whMsg = whError.code === 'LIMIT_FILE_SIZE' ? '图片不能超过 10MB' : whError.message;
    whRes.json({ code: 1, msg: `上传失败：${whMsg}`, data: {} });
  });
}

async function whDescribe(whReq, whRes) {
  if (!whReq.file) {
    whRes.json({ code: 1, msg: '请选择要识别的图片（字段名 image）', data: {} });
    return;
  }

  const whPrompt = typeof whReq.body.prompt === 'string' && whReq.body.prompt.trim()
    ? whReq.body.prompt.trim().slice(0, 500)
    : WH_DEFAULT_PROMPT;

  console.log('[wh_vision] 发送给大模型的数据：', JSON.stringify({
    model: whVisionModel.whVisionConfig.model,
    prompt: whPrompt,
    imageBytes: whReq.file.size,
    mime: whReq.file.mimetype
  }));

  try {
    const whResult = await whVisionModel.whDescribeImage(
      whReq.file.buffer,
      whReq.file.mimetype,
      whPrompt
    );

    console.log('[wh_vision] 接收自大模型的数据：', whResult.description);

    whRes.json({
      code: 0,
      msg: '图像识别成功',
      data: {
        description: whResult.description,
        model: whResult.model,
        usage: whResult.usage
      }
    });
  } catch (whError) {
    console.error('[wh_vision] 图像识别失败：', whError.message);
    whRes.json({ code: 1, msg: `图像识别失败：${whError.message}`, data: {} });
  }
}

module.exports = {
  whUploadMiddleware,
  whDescribe
};
