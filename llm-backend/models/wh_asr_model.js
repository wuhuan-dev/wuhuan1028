/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const whAsrConfig = {
  apiKey: process.env.QINIU_API_KEY || '',
  baseUrl: process.env.QINIU_BASE_URL || 'https://api.qnaigc.com/v1',
  model: process.env.QINIU_ASR_MODEL || 'qwen-audio-3.0-asr-flash'
};

async function whReadErrorText(whResponse) {
  if (whResponse.status === 401 || whResponse.status === 403) {
    return 'API Key 无效或已过期，请检查 backend/.env 中的 QINIU_API_KEY';
  }

  try {
    const whErrorText = await whResponse.text();
    if (!whErrorText) {
      return `HTTP ${whResponse.status}`;
    }
    const whErrorJson = JSON.parse(whErrorText);
    const whErrorInfo = whErrorJson.error || whErrorJson;
    return whErrorInfo.message || whErrorInfo.msg || `HTTP ${whResponse.status}`;
  } catch (whError) {
    return `HTTP ${whResponse.status}`;
  }
}

async function whTranscribeAudio(whBuffer, whMime, whFileName) {
  if (!whAsrConfig.apiKey) {
    throw new Error('后端未配置 QINIU_API_KEY，请检查 backend/.env');
  }

  const whForm = new FormData();
  whForm.append('file', new Blob([whBuffer], { type: whMime }), whFileName || 'audio.wav');
  whForm.append('model', whAsrConfig.model);

  let whResponse;
  try {
    whResponse = await fetch(`${whAsrConfig.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${whAsrConfig.apiKey}` },
      body: whForm,
      signal: AbortSignal.timeout(90000)
    });
  } catch (whError) {
    if (whError.name === 'TimeoutError' || whError.name === 'AbortError') {
      throw new Error('语音识别超时（90 秒），请稍后重试');
    }
    throw whError;
  }

  if (!whResponse.ok) {
    const whReason = await whReadErrorText(whResponse);
    throw new Error(`语音识别接口返回异常：${whReason}`);
  }

  const whResult = await whResponse.json();

  return {
    text: whResult.text || '',
    model: whAsrConfig.model,
    usage: whResult.usage || {}
  };
}

module.exports = {
  whAsrConfig,
  whTranscribeAudio
};
