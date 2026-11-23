/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const WH_PROVIDERS = {
  qiniu: {
    key: 'qiniu',
    name: '七牛云',
    apiKey: process.env.QINIU_API_KEY || '',
    baseUrl: process.env.QINIU_BASE_URL || 'https://api.qnaigc.com/v1',
    model: process.env.QINIU_MODEL || 'qiniu/conatus-free',
    keyName: 'QINIU_API_KEY'
  },
  siliconflow: {
    key: 'siliconflow',
    name: '硅基流动',
    apiKey: process.env.SILICONFLOW_API_KEY || '',
    baseUrl: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
    model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V3',
    keyName: 'SILICONFLOW_API_KEY'
  }
};

const WH_MAX_ATTEMPTS = 3;

function whGetProvider(whName) {
  const whProvider = WH_PROVIDERS[whName];
  if (!whProvider) {
    throw new Error(`不支持的平台：${whName}，仅支持 qiniu 或 siliconflow`);
  }
  if (!whProvider.apiKey) {
    throw new Error(`后端未配置 ${whProvider.keyName}，请检查 backend/.env`);
  }
  return whProvider;
}

function whBuildHeaders(whProvider) {
  return {
    Authorization: `Bearer ${whProvider.apiKey}`,
    'Content-Type': 'application/json'
  };
}

async function whReadErrorText(whResponse, whProvider) {
  if (whResponse.status === 401 || whResponse.status === 403) {
    return `API Key 无效或已过期，请检查 backend/.env 中的 ${whProvider.keyName}`;
  }

  try {
    const whErrorText = await whResponse.text();
    if (!whErrorText) {
      return `HTTP ${whResponse.status}`;
    }

    const whErrorJson = JSON.parse(whErrorText);
    const whErrorInfo = whErrorJson.error || whErrorJson;
    const whReason = whErrorInfo.message || whErrorInfo.msg || `HTTP ${whResponse.status}`;

    if (whErrorInfo.code === 'free_campaign_global_limit' || whResponse.status === 429) {
      return `${whReason}（免费模型请求过多，请稍后重试）`;
    }
    return whReason;
  } catch (whError) {
    return `HTTP ${whResponse.status}`;
  }
}

function whSleep(whMs) {
  return new Promise(function whResolve(resolve) {
    setTimeout(resolve, whMs);
  });
}

async function whFetchCompletion(whProvider, whPayload, whTimeoutMs, whClientSignal) {
  for (let whAttempt = 1; whAttempt <= WH_MAX_ATTEMPTS; whAttempt += 1) {
    const whSignals = [AbortSignal.timeout(whTimeoutMs)];
    if (whClientSignal) {
      whSignals.push(whClientSignal);
    }

    let whResponse;
    try {
      whResponse = await fetch(`${whProvider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: whBuildHeaders(whProvider),
        signal: AbortSignal.any(whSignals),
        body: JSON.stringify(whPayload)
      });
    } catch (whError) {
      if (whClientSignal && whClientSignal.aborted) {
        throw whError;
      }
      if (whError.name === 'TimeoutError' || whError.name === 'AbortError') {
        throw new Error(`${whProvider.name}接口响应超时（${Math.round(whTimeoutMs / 1000)} 秒），请稍后重试`);
      }
      throw whError;
    }

    if (whResponse.status === 429 && whAttempt < WH_MAX_ATTEMPTS) {
      await whSleep(1000 * whAttempt);
      continue;
    }

    return whResponse;
  }
}

async function whKefuChatOnce(whMessages, whProviderName) {
  const whProvider = whGetProvider(whProviderName || 'qiniu');

  const whResponse = await whFetchCompletion(
    whProvider,
    {
      model: whProvider.model,
      messages: whMessages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: false
    },
    60000
  );

  if (!whResponse.ok) {
    const whReason = await whReadErrorText(whResponse, whProvider);
    throw new Error(`${whProvider.name}接口返回异常：${whReason}`);
  }

  const whResult = await whResponse.json();
  const whChoice = (whResult.choices && whResult.choices[0]) || {};
  const whAnswer = (whChoice.message && whChoice.message.content) || '';

  return {
    answer: whAnswer,
    provider: whProvider.key,
    model: whResult.model || whProvider.model,
    usage: whResult.usage || {}
  };
}

async function* whKefuStreamChat(whMessages, whSignal, whProviderName) {
  const whProvider = whGetProvider(whProviderName || 'qiniu');

  const whResponse = await whFetchCompletion(
    whProvider,
    {
      model: whProvider.model,
      messages: whMessages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true
    },
    90000,
    whSignal
  );

  if (!whResponse.ok) {
    const whReason = await whReadErrorText(whResponse, whProvider);
    throw new Error(`${whProvider.name}接口返回异常：${whReason}`);
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
  WH_PROVIDERS,
  whGetProvider,
  whKefuChatOnce,
  whKefuStreamChat
};
