/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const whKefuModel = require('../models/wh_kefu_model');

const WH_MAX_CONTENT_LENGTH = 4000;
const WH_ALLOWED_ROLES = ['system', 'user', 'assistant'];

function whNormalizeMessages(whRawMessages) {
  if (!Array.isArray(whRawMessages) || whRawMessages.length === 0) {
    return { ok: false, msg: '请提供 messages 数组，且至少包含一条消息' };
  }

  const whMessages = [];
  for (const whItem of whRawMessages) {
    if (!whItem || typeof whItem !== 'object') {
      return { ok: false, msg: 'messages 中的每条消息必须是对象' };
    }

    const whRole = whItem.role;
    const whContent = typeof whItem.content === 'string' ? whItem.content.trim() : '';

    if (!WH_ALLOWED_ROLES.includes(whRole)) {
      return { ok: false, msg: 'messages 中的 role 只能是 system、user 或 assistant' };
    }
    if (!whContent) {
      return { ok: false, msg: 'messages 中的 content 不能为空' };
    }
    if (whContent.length > WH_MAX_CONTENT_LENGTH) {
      return { ok: false, msg: `单条消息内容不能超过 ${WH_MAX_CONTENT_LENGTH} 个字符` };
    }

    whMessages.push({ role: whRole, content: whContent });
  }

  return { ok: true, messages: whMessages };
}

function whResolveProvider(whBody) {
  const whProviderName = (whBody && whBody.provider) || 'qiniu';
  try {
    return { ok: true, provider: whKefuModel.whGetProvider(whProviderName) };
  } catch (whError) {
    return { ok: false, msg: whError.message };
  }
}

async function whKefuChat(whReq, whRes) {
  const whCheck = whNormalizeMessages(whReq.body && whReq.body.messages);
  if (!whCheck.ok) {
    whRes.json({ code: 1, msg: whCheck.msg, data: {} });
    return;
  }

  const whProviderCheck = whResolveProvider(whReq.body);
  if (!whProviderCheck.ok) {
    whRes.json({ code: 1, msg: whProviderCheck.msg, data: {} });
    return;
  }

  try {
    const whResult = await whKefuModel.whKefuChatOnce(whCheck.messages, whProviderCheck.provider.key);
    whRes.json({
      code: 0,
      msg: '客服回复成功',
      data: {
        answer: whResult.answer,
        provider: whResult.provider,
        model: whResult.model,
        usage: whResult.usage
      }
    });
  } catch (whError) {
    console.error('[wh_api] 在线客服问答失败：', whError.message);
    whRes.json({ code: 1, msg: `在线客服问答失败：${whError.message}`, data: {} });
  }
}

async function whKefuChatStream(whReq, whRes) {
  const whCheck = whNormalizeMessages(whReq.body && whReq.body.messages);
  if (!whCheck.ok) {
    whRes.json({ code: 1, msg: whCheck.msg, data: {} });
    return;
  }

  const whProviderCheck = whResolveProvider(whReq.body);
  if (!whProviderCheck.ok) {
    whRes.json({ code: 1, msg: whProviderCheck.msg, data: {} });
    return;
  }

  const whProvider = whProviderCheck.provider;

  whRes.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  whRes.setHeader('Cache-Control', 'no-cache, no-transform');
  whRes.setHeader('Connection', 'keep-alive');
  whRes.setHeader('X-Accel-Buffering', 'no');
  whRes.flushHeaders();

  const whAbortController = new AbortController();
  let whClosed = false;
  let whFinished = false;

  whRes.on('close', function whHandleClientClose() {
    if (whFinished) {
      return;
    }
    whClosed = true;
    whAbortController.abort();
  });

  function whSendEvent(whPayload) {
    whRes.write(`data: ${typeof whPayload === 'string' ? whPayload : JSON.stringify(whPayload)}\n\n`);
  }

  whSendEvent({ type: 'meta', provider: whProvider.key, model: whProvider.model });

  let whFullAnswer = '';

  try {
    for await (const whPiece of whKefuModel.whKefuStreamChat(
      whCheck.messages,
      whAbortController.signal,
      whProvider.key
    )) {
      if (whClosed) {
        break;
      }
      whFullAnswer += whPiece;
      whSendEvent({ type: 'chunk', content: whPiece });
    }

    if (!whClosed) {
      whFinished = true;
      whSendEvent({ type: 'done', provider: whProvider.key, model: whProvider.model, answer: whFullAnswer });
      whSendEvent('[DONE]');
      whRes.end();
    }
  } catch (whError) {
    if (whClosed) {
      whRes.end();
      return;
    }

    const whIsTimeout = whError.name === 'AbortError' || whError.name === 'TimeoutError';
    const whReason = whIsTimeout ? '客服响应超时（90 秒），请稍后重试' : whError.message;

    console.error('[wh_api] 在线客服流式问答失败：', whReason);
    whFinished = true;
    whSendEvent({ type: 'error', msg: `在线客服问答失败：${whReason}` });
    whSendEvent('[DONE]');
    whRes.end();
  }
}

module.exports = { whKefuChat, whKefuChatStream };
