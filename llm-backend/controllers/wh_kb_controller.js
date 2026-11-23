/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const whKbModel = require('../models/wh_kb_model');
const whKefuModel = require('../models/wh_kefu_model');
const whKbParser = require('../utils/wh_kb_parser');

const WH_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'kb');
fs.mkdirSync(WH_UPLOAD_DIR, { recursive: true });

const whStorage = multer.diskStorage({
  destination: function whDestination(whReq, whFile, whCallback) {
    whCallback(null, WH_UPLOAD_DIR);
  },
  filename: function whFilename(whReq, whFile, whCallback) {
    const whOriginalName = Buffer.from(whFile.originalname, 'latin1').toString('utf8');
    const whSafeName = whOriginalName.replace(/[\\/:*?"<>|]/g, '_');
    whCallback(null, `${Date.now()}_${whSafeName}`);
  }
});

const whUploadSingle = multer({
  storage: whStorage,
  limits: { fileSize: 15 * 1024 * 1024 }
}).single('file');

function whUploadMiddleware(whReq, whRes, whNext) {
  whUploadSingle(whReq, whRes, function whHandleUpload(whError) {
    if (!whError) {
      whNext();
      return;
    }
    const whMsg = whError.code === 'LIMIT_FILE_SIZE' ? '文件不能超过 15MB' : `上传失败：${whError.message}`;
    whRes.json({ code: 1, msg: whMsg, data: {} });
  });
}

function whRemoveFileIfExists(whFilePath) {
  if (!whFilePath) {
    return;
  }
  fs.promises.unlink(whFilePath).catch(function whIgnore() {});
}

async function whUploadFile(whReq, whRes) {
  if (!whReq.file) {
    whRes.json({ code: 1, msg: '请选择要上传的知识库文件（字段名 file）', data: {} });
    return;
  }

  const whFilePath = whReq.file.path;
  const whOriginalName = Buffer.from(whReq.file.originalname, 'latin1').toString('utf8');
  const whExt = path.extname(whOriginalName).toLowerCase();

  try {
    if (!whKbParser.whIsSupported(whExt)) {
      throw new Error(`不支持的文件格式：${whExt || '未知'}，支持 ${whKbParser.WH_SUPPORTED_EXTS.join('、')}`);
    }

    const whText = await whKbParser.whParseFile(whFilePath);
    if (!whText) {
      throw new Error('没有解析到文本内容，请检查文件是否为空或已加密');
    }

    const whChunks = whKbParser.whSplitText(whText);
    const whFileId = await whKbModel.whCreateFile({
      name: whOriginalName,
      ext: whExt,
      size: whReq.file.size,
      path: whFilePath,
      chunkCount: whChunks.length
    });
    await whKbModel.whInsertChunks(whFileId, whOriginalName, whChunks);

    console.log('[wh_kb] 文件解析完成：', whOriginalName, '分片数：', whChunks.length);

    whRes.json({
      code: 0,
      msg: '知识库文件上传成功',
      data: {
        id: whFileId,
        name: whOriginalName,
        ext: whExt,
        size: whReq.file.size,
        chunkCount: whChunks.length
      }
    });
  } catch (whError) {
    whRemoveFileIfExists(whFilePath);
    console.error('[wh_kb] 文件解析失败：', whError.message);
    whRes.json({ code: 1, msg: `文件解析失败：${whError.message}`, data: {} });
  }
}

async function whListFiles(whReq, whRes) {
  try {
    const whFiles = await whKbModel.whListFiles();
    whRes.json({ code: 0, msg: '知识库文件获取成功', data: { total: whFiles.length, list: whFiles } });
  } catch (whError) {
    console.error('[wh_kb] 文件列表获取失败：', whError.message);
    whRes.json({ code: 1, msg: `知识库文件获取失败：${whError.message}`, data: {} });
  }
}

async function whDeleteFile(whReq, whRes) {
  const whFileId = Number(whReq.params.id);

  if (!Number.isInteger(whFileId) || whFileId <= 0) {
    whRes.json({ code: 1, msg: '文件 ID 不合法', data: {} });
    return;
  }

  try {
    const whFile = await whKbModel.whGetFileById(whFileId);
    if (!whFile) {
      whRes.json({ code: 1, msg: '文件不存在或已被删除', data: {} });
      return;
    }

    await whKbModel.whDeleteFile(whFileId);
    whRemoveFileIfExists(whFile.wh_path);

    whRes.json({ code: 0, msg: '知识库文件已删除', data: { id: whFileId } });
  } catch (whError) {
    console.error('[wh_kb] 文件删除失败：', whError.message);
    whRes.json({ code: 1, msg: `文件删除失败：${whError.message}`, data: {} });
  }
}

function whNormalizeMessages(whRawMessages) {
  if (!Array.isArray(whRawMessages) || whRawMessages.length === 0) {
    return { ok: false, msg: '请提供 messages 数组，且至少包含一条消息' };
  }

  const whMessages = [];
  for (const whItem of whRawMessages) {
    if (!whItem || !['user', 'assistant'].includes(whItem.role)) {
      return { ok: false, msg: 'messages 中的 role 只能是 user 或 assistant' };
    }
    const whContent = typeof whItem.content === 'string' ? whItem.content.trim() : '';
    if (!whContent) {
      return { ok: false, msg: 'messages 中的 content 不能为空' };
    }
    whMessages.push({ role: whItem.role, content: whContent });
  }
  return { ok: true, messages: whMessages };
}

function whBuildRagPrompt(whChunks) {
  const whContext = whChunks.map(function whFormat(whChunk, whIndex) {
    return `【片段 ${whIndex + 1}】来源：${whChunk.fileName}\n${whChunk.content}`;
  }).join('\n\n');

  return [
    '你是“中华美食街”知识库问答助手。请严格依据下面的知识库片段回答用户问题。',
    '规则：1. 只使用知识库片段中的信息作答，不要编造；2. 如果片段中没有答案，直接回答“知识库中暂未找到相关内容”；3. 使用简体中文，简洁准确，可注明信息来自哪个文件。',
    '知识库片段：',
    whContext
  ].join('\n');
}

async function whKbChatStream(whReq, whRes) {
  const whCheck = whNormalizeMessages(whReq.body && whReq.body.messages);
  if (!whCheck.ok) {
    whRes.json({ code: 1, msg: whCheck.msg, data: {} });
    return;
  }

  const whProviderName = (whReq.body && whReq.body.provider) || 'siliconflow';
  let whProvider;
  try {
    whProvider = whKefuModel.whGetProvider(whProviderName);
  } catch (whError) {
    whRes.json({ code: 1, msg: whError.message, data: {} });
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

  const whLastQuestion = [...whCheck.messages].reverse().find(function whFindUser(whItem) {
    return whItem.role === 'user';
  });

  let whChunks = [];
  try {
    const whAllChunks = await whKbModel.whListAllChunks();
    whChunks = whKbParser.whRetrieveChunks(whAllChunks, whLastQuestion ? whLastQuestion.content : '', 3);
  } catch (whError) {
    console.error('[wh_kb] 知识库检索失败：', whError.message);
  }

  const whSources = [];
  whChunks.forEach(function whCollect(whChunk) {
    if (!whSources.includes(whChunk.fileName)) {
      whSources.push(whChunk.fileName);
    }
  });

  whSendEvent({ type: 'meta', provider: whProvider.key, model: whProvider.model, retrieved: whChunks.length, sources: whSources });

  if (!whChunks.length) {
    const whEmptyAnswer = '知识库中暂未找到相关内容，请换个说法，或先上传相关资料后再提问。';
    console.log('[wh_rag] 未检索到知识库片段，未调用大模型');
    whSendEvent({ type: 'chunk', content: whEmptyAnswer });
    whFinished = true;
    whSendEvent({ type: 'done', answer: whEmptyAnswer, sources: [] });
    whSendEvent('[DONE]');
    whRes.end();
    return;
  }

  const whMessages = [
    { role: 'system', content: whBuildRagPrompt(whChunks) }
  ].concat(whCheck.messages);

  console.log('[wh_rag] 检索命中片段数：', whChunks.length, '来源：', whSources.join('、'));
  console.log('[wh_rag] 发送给大模型的数据：', JSON.stringify(whMessages));

  let whFullAnswer = '';

  try {
    for await (const whPiece of whKefuModel.whKefuStreamChat(
      whMessages,
      whAbortController.signal,
      whProvider.key
    )) {
      if (whClosed) {
        break;
      }
      console.log('[wh_rag] 收到大模型分片：', whPiece);
      whFullAnswer += whPiece;
      whSendEvent({ type: 'chunk', content: whPiece });
    }

    if (!whClosed) {
      whFinished = true;
      console.log('[wh_rag] 大模型返回完整回答：', whFullAnswer);
      whSendEvent({ type: 'done', answer: whFullAnswer, sources: whSources });
      whSendEvent('[DONE]');
      whRes.end();
    }
  } catch (whError) {
    if (whClosed) {
      whRes.end();
      return;
    }

    const whIsTimeout = whError.name === 'AbortError' || whError.name === 'TimeoutError';
    const whReason = whIsTimeout ? '知识库问答超时（90 秒），请稍后重试' : whError.message;

    console.error('[wh_rag] 知识库问答失败：', whReason);
    whFinished = true;
    whSendEvent({ type: 'error', msg: `知识库问答失败：${whReason}` });
    whSendEvent('[DONE]');
    whRes.end();
  }
}

module.exports = {
  whUploadMiddleware,
  whUploadFile,
  whListFiles,
  whDeleteFile,
  whKbChatStream
};
