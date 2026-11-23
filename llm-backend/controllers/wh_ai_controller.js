/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const whAIModel = require('../models/wh_ai_model');

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

async function whChat(whReq, whRes) {
  const whCheck = whNormalizeMessages(whReq.body && whReq.body.messages);
  if (!whCheck.ok) {
    whRes.json({ code: 1, msg: whCheck.msg, data: {} });
    return;
  }

  try {
    const whResult = await whAIModel.whChatOnce(whCheck.messages);
    whRes.json({
      code: 0,
      msg: 'AI 回复成功',
      data: {
        answer: whResult.answer,
        model: whResult.model,
        usage: whResult.usage
      }
    });
  } catch (whError) {
    console.error('[wh_api] AI 问答失败：', whError.message);
    whRes.json({ code: 1, msg: `AI 问答失败：${whError.message}`, data: {} });
  }
}

async function whChatStream(whReq, whRes) {
  const whCheck = whNormalizeMessages(whReq.body && whReq.body.messages);
  if (!whCheck.ok) {
    whRes.json({ code: 1, msg: whCheck.msg, data: {} });
    return;
  }

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

  whSendEvent({ type: 'meta', model: whAIModel.whAIConfig.model });

  let whFullAnswer = '';

  try {
    for await (const whPiece of whAIModel.whStreamChat(
      whCheck.messages,
      whAbortController.signal
    )) {
      if (whClosed) {
        break;
      }
      whFullAnswer += whPiece;
      whSendEvent({ type: 'chunk', content: whPiece });
    }

    if (!whClosed) {
      whFinished = true;
      whSendEvent({ type: 'done', model: whAIModel.whAIConfig.model, answer: whFullAnswer });
      whSendEvent('[DONE]');
      whRes.end();
    }
  } catch (whError) {
    if (whClosed) {
      whRes.end();
      return;
    }

    const whIsTimeout = whError.name === 'AbortError' || whError.name === 'TimeoutError';
    const whReason = whIsTimeout ? 'AI 响应超时（90 秒），请稍后重试' : whError.message;

    console.error('[wh_api] AI 流式问答失败：', whReason);
    whFinished = true;
    whSendEvent({ type: 'error', msg: `AI 问答失败：${whReason}` });
    whSendEvent('[DONE]');
    whRes.end();
  }
}

module.exports = { whChat, whChatStream };
