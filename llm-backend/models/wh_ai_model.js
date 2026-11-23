/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const whAIConfig = {
  apiKey: process.env.SILICONFLOW_API_KEY || '',
  baseUrl: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
  model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V3'
};

function whBuildRequestHeaders() {
  return {
    Authorization: `Bearer ${whAIConfig.apiKey}`,
    'Content-Type': 'application/json'
  };
}

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
    const whMessage =
      (whErrorJson.error && (whErrorJson.error.message || whErrorJson.error.code)) ||
      whErrorJson.message;
    return whMessage || `HTTP ${whResponse.status}`;
  } catch (whError) {
    return `HTTP ${whResponse.status}`;
  }
}

function whAssertConfig() {
  if (!whAIConfig.apiKey) {
    throw new Error('后端未配置 SILICONFLOW_API_KEY，请检查 backend/.env');
  }
}

async function whChatOnce(whMessages) {
  whAssertConfig();

  let whResponse;
  try {
    whResponse = await fetch(`${whAIConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: whBuildRequestHeaders(),
      signal: AbortSignal.timeout(60000),
      body: JSON.stringify({
        model: whAIConfig.model,
        messages: whMessages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      })
    });
  } catch (whError) {
    if (whError.name === 'TimeoutError' || whError.name === 'AbortError') {
      throw new Error('硅基流动接口响应超时（60 秒），请稍后重试');
    }
    throw whError;
  }

  if (!whResponse.ok) {
    const whReason = await whReadErrorText(whResponse);
    throw new Error(`硅基流动接口返回异常：${whReason}`);
  }

  const whResult = await whResponse.json();
  const whChoice = (whResult.choices && whResult.choices[0]) || {};
  const whAnswer = (whChoice.message && whChoice.message.content) || '';

  return {
    answer: whAnswer,
    model: whResult.model || whAIConfig.model,
    usage: whResult.usage || {}
  };
}

async function* whStreamChat(whMessages, whSignal) {
  whAssertConfig();

  const whSignals = [AbortSignal.timeout(90000)];
  if (whSignal) {
    whSignals.push(whSignal);
  }

  const whResponse = await fetch(`${whAIConfig.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: whBuildRequestHeaders(),
    signal: AbortSignal.any(whSignals),
    body: JSON.stringify({
      model: whAIConfig.model,
      messages: whMessages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true
    })
  });

  if (!whResponse.ok) {
    const whReason = await whReadErrorText(whResponse);
    throw new Error(`硅基流动接口返回异常：${whReason}`);
  }

  const whReader = whResponse.body.getReader();
  const whDecoder = new TextDecoder('utf-8');
  let whBuffer = '';

  while (true) {
    const { done: whDone, value: whChunk } = await whReader.read();
    if (whDone) {
      break;
    }

    whBuffer += whDecoder.decode(whChunk, { stream: true });
    const whEvents = whBuffer.split('\n\n');
    whBuffer = whEvents.pop() || '';

    for (const whEvent of whEvents) {
      const whLines = whEvent.split('\n');
      for (const whLine of whLines) {
        if (!whLine.startsWith('data:')) {
          continue;
        }
        const whPayload = whLine.slice(5).trim();
        if (!whPayload || whPayload === '[DONE]') {
          continue;
        }

        let whJson = null;
        try {
          whJson = JSON.parse(whPayload);
        } catch (whParseError) {
          continue;
        }

        const whDelta = whJson.choices && whJson.choices[0] && whJson.choices[0].delta;
        if (whDelta && whDelta.content) {
          yield whDelta.content;
        }
      }
    }
  }
}

module.exports = {
  whAIConfig,
  whChatOnce,
  whStreamChat
};
