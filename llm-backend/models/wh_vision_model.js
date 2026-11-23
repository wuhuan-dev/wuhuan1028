/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const whVisionConfig = {
  apiKey: process.env.SILICONFLOW_API_KEY || '',
  baseUrl: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
  model: process.env.SILICONFLOW_VISION_MODEL || 'Qwen/Qwen3-VL-8B-Instruct'
};

async function whReadErrorText(whResponse) {
  if (whResponse.status === 401 || whResponse.status === 403) {
    return 'API Key 无效或已过期，请检查 backend/.env 中的 SILICONFLOW_API_KEY';
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

async function whDescribeImage(whBuffer, whMime, whPrompt) {
  if (!whVisionConfig.apiKey) {
    throw new Error('后端未配置 SILICONFLOW_API_KEY，请检查 backend/.env');
  }

  const whDataUrl = `data:${whMime};base64,${whBuffer.toString('base64')}`;
  const whMessages = [{
    role: 'user',
    content: [
      { type: 'text', text: whPrompt },
      { type: 'image_url', image_url: { url: whDataUrl } }
    ]
  }];

  let whResponse;
  try {
    whResponse = await fetch(`${whVisionConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${whVisionConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(90000),
      body: JSON.stringify({
        model: whVisionConfig.model,
        messages: whMessages,
        max_tokens: 600,
        stream: false
      })
    });
  } catch (whError) {
    if (whError.name === 'TimeoutError' || whError.name === 'AbortError') {
      throw new Error('图像识别超时（90 秒），请稍后重试');
    }
    throw whError;
  }

  if (!whResponse.ok) {
    const whReason = await whReadErrorText(whResponse);
    throw new Error(`图像识别接口返回异常：${whReason}`);
  }

  const whResult = await whResponse.json();
  const whChoice = (whResult.choices && whResult.choices[0]) || {};
  const whDescription = (whChoice.message && whChoice.message.content) || '';

  return {
    description: whDescription,
    model: whResult.model || whVisionConfig.model,
    usage: whResult.usage || {}
  };
}

module.exports = {
  whVisionConfig,
  whDescribeImage
};
