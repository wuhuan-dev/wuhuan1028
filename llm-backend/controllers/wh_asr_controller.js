/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const multer = require('multer');
const whAsrModel = require('../models/wh_asr_model');

const WH_ALLOWED_AUDIO_MIMES = [
  'audio/wav',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a'
];

const whUploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
}).single('audio');

function whUploadMiddleware(whReq, whRes, whNext) {
  whUploadSingle(whReq, whRes, function whHandleUpload(whError) {
    if (!whError) {
      whNext();
      return;
    }
    const whMsg = whError.code === 'LIMIT_FILE_SIZE' ? '音频不能超过 20MB' : whError.message;
    whRes.json({ code: 1, msg: `上传失败：${whMsg}`, data: {} });
  });
}

async function whTranscribe(whReq, whRes) {
  if (!whReq.file) {
    whRes.json({ code: 1, msg: '请选择要识别的音频（字段名 audio）', data: {} });
    return;
  }

  const whMime = whReq.file.mimetype || 'audio/wav';
  const whIsAudio = whMime.startsWith('audio/') || WH_ALLOWED_AUDIO_MIMES.includes(whMime);

  if (!whIsAudio) {
    whRes.json({ code: 1, msg: '只支持音频文件（wav、mp3、webm、ogg、m4a）', data: {} });
    return;
  }

  const whOriginalName = Buffer.from(whReq.file.originalname, 'latin1').toString('utf8');

  console.log('[wh_asr] 发送给大模型的数据：', JSON.stringify({
    api: '/audio/transcriptions',
    model: whAsrModel.whAsrConfig.model,
    fileName: whOriginalName,
    mime: whMime,
    audioBytes: whReq.file.size
  }));

  try {
    const whResult = await whAsrModel.whTranscribeAudio(whReq.file.buffer, whMime, whOriginalName);

    console.log('[wh_asr] 接收自大模型的数据：', JSON.stringify({ text: whResult.text, usage: whResult.usage }));

    whRes.json({
      code: 0,
      msg: '语音识别成功',
      data: {
        text: whResult.text,
        model: whResult.model,
        usage: whResult.usage
      }
    });
  } catch (whError) {
    console.error('[wh_asr] 语音识别失败：', whError.message);
    whRes.json({ code: 1, msg: `语音识别失败：${whError.message}`, data: {} });
  }
}

module.exports = {
  whUploadMiddleware,
  whTranscribe
};
