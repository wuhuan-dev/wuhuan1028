/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */

(function whInitKbPage() {
  const whFileInput = document.getElementById('wh_kb_file');
  const whPickButton = document.getElementById('wh_kb_pick');
  const whFileName = document.getElementById('wh_kb_filename');
  const whUploadForm = document.getElementById('wh_kb_upload_form');
  const whSubmitButton = document.getElementById('wh_kb_submit');
  const whStatus = document.getElementById('wh_kb_status');
  const whList = document.getElementById('wh_kb_list');
  const whCount = document.getElementById('wh_kb_count');

  const whChatForm = document.getElementById('wh_kb_chat_form');
  const whInput = document.getElementById('wh_kb_input');
  const whSendButton = document.getElementById('wh_kb_send');
  const whMessagesBox = document.getElementById('wh_kb_messages');
  const whProviderSelect = document.getElementById('wh_kb_provider');

  const whHistory = [];
  let whChatPending = false;
  let whUploading = false;
  let whAbortController = null;

  function whFormatSize(whBytes) {
    if (whBytes < 1024) {
      return `${whBytes} B`;
    }
    if (whBytes < 1024 * 1024) {
      return `${(whBytes / 1024).toFixed(1)} KB`;
    }
    return `${(whBytes / 1024 / 1024).toFixed(2)} MB`;
  }

  function whRenderFiles(whFiles) {
    whList.innerHTML = '';
    whCount.textContent = `${whFiles.length} 个文件`;

    if (!whFiles.length) {
      const whEmpty = document.createElement('li');
      whEmpty.className = 'wh_kb_empty';
      whEmpty.textContent = '知识库还是空的，先上传一个文件吧';
      whList.appendChild(whEmpty);
      return;
    }

    whFiles.forEach(function whRender(whFile) {
      const whItem = document.createElement('li');
      whItem.className = 'wh_kb_item';

      const whMain = document.createElement('div');
      whMain.className = 'wh_kb_item_main';

      const whName = document.createElement('span');
      whName.className = 'wh_kb_item_name';
      whName.textContent = whFile.name;
      whName.title = whFile.name;

      const whMeta = document.createElement('span');
      whMeta.className = 'wh_kb_item_meta';
      whMeta.textContent = `${whFile.ext} · ${whFormatSize(whFile.size)} · ${whFile.chunkCount} 个分片 · ${whFile.createTime}`;

      const whDelete = document.createElement('button');
      whDelete.className = 'wh_kb_delete';
      whDelete.type = 'button';
      whDelete.textContent = '删除';
      whDelete.addEventListener('click', function whHandleDelete() {
        whDeleteFile(whFile, whDelete);
      });

      whMain.appendChild(whName);
      whMain.appendChild(whMeta);
      whItem.appendChild(whMain);
      whItem.appendChild(whDelete);
      whList.appendChild(whItem);
    });
  }

  async function whLoadFiles() {
    try {
      const whResponse = await fetch('http://localhost:8028/api/kb/files');
      const whResult = await whResponse.json();
      console.log('[wh_frontend] 知识库文件列表：', whResult);

      if (whResult.code !== 0) {
        throw new Error(whResult.msg || '获取知识库文件失败');
      }
      whRenderFiles(whResult.data.list || []);
    } catch (whError) {
      console.error('[wh_frontend] 知识库文件列表获取失败：', whError);
      whList.innerHTML = '<li class="wh_kb_empty">知识库文件加载失败，请刷新重试</li>';
    }
  }

  async function whDeleteFile(whFile, whButton) {
    if (!window.confirm(`确定删除知识库文件「${whFile.name}」吗？`)) {
      return;
    }

    whButton.disabled = true;
    try {
      const whResponse = await fetch(`http://localhost:8028/api/kb/files/${whFile.id}`, { method: 'DELETE' });
      const whResult = await whResponse.json();
      console.log('[wh_frontend] 删除知识库文件：', whResult);

      if (whResult.code !== 0) {
        throw new Error(whResult.msg || '删除失败');
      }
      whStatus.textContent = `已删除：${whFile.name}`;
      await whLoadFiles();
    } catch (whError) {
      console.error('[wh_frontend] 删除知识库文件失败：', whError);
      whStatus.textContent = `删除失败：${whError.message}`;
      whButton.disabled = false;
    }
  }

  async function whUpload() {
    if (whUploading) {
      return;
    }

    const whFile = whFileInput.files && whFileInput.files[0];
    if (!whFile) {
      whStatus.textContent = '请先点击“选择文件”';
      return;
    }

    const whFormData = new FormData();
    whFormData.append('file', whFile);

    whUploading = true;
    whSubmitButton.disabled = true;
    whPickButton.disabled = true;
    whStatus.textContent = `正在解析「${whFile.name}」…`;

    try {
      const whResponse = await fetch('http://localhost:8028/api/kb/files', { method: 'POST', body: whFormData });
      const whResult = await whResponse.json();
      console.log('[wh_frontend] 知识库文件上传结果：', whResult);

      if (whResult.code !== 0) {
        throw new Error(whResult.msg || '上传失败');
      }

      whStatus.textContent = `上传成功：${whResult.data.name}（${whResult.data.chunkCount} 个分片）`;
      whFileInput.value = '';
      whFileName.textContent = '未选择文件';
      await whLoadFiles();
    } catch (whError) {
      console.error('[wh_frontend] 知识库文件上传失败：', whError);
      whStatus.textContent = `上传失败：${whError.message}`;
    } finally {
      whUploading = false;
      whSubmitButton.disabled = false;
      whPickButton.disabled = false;
    }
  }

  function whScrollToBottom() {
    whMessagesBox.scrollTop = whMessagesBox.scrollHeight;
  }

  function whAppendMessage(whRole, whText) {
    const whItem = document.createElement('div');
    whItem.className = `wh_kb_msg wh_kb_msg--${whRole === 'user' ? 'user' : 'ai'}`;

    const whRoleLabel = document.createElement('span');
    whRoleLabel.className = 'wh_kb_msg_role';
    whRoleLabel.textContent = whRole === 'user' ? '我' : '知识库助手';

    const whBubble = document.createElement('div');
    whBubble.className = 'wh_kb_bubble';
    whBubble.textContent = whText;

    whItem.appendChild(whRoleLabel);
    whItem.appendChild(whBubble);
    whMessagesBox.appendChild(whItem);
    whScrollToBottom();

    return { whItem, whBubble };
  }

  function whHandleStreamEvent(whPayloadText, whState) {
    if (!whPayloadText || whPayloadText === '[DONE]') {
      return;
    }

    let whEvent = null;
    try {
      whEvent = JSON.parse(whPayloadText);
    } catch (whParseError) {
      console.warn('[wh_frontend] 无法解析的流事件：', whPayloadText);
      return;
    }

    console.log('[wh_frontend] 接收自大模型的数据：', whEvent);

    if (whEvent.type === 'meta') {
      return;
    }

    if (whEvent.type === 'chunk' && whEvent.content) {
      if (whState.whThinking) {
        whState.whThinking = false;
        whState.whBubble.classList.remove('wh_kb_bubble--thinking');
        whState.whBubble.textContent = '';
      }
      whState.whAnswer += whEvent.content;
      whState.whBubble.textContent = whState.whAnswer;
      whScrollToBottom();
      return;
    }

    if (whEvent.type === 'done' && whEvent.sources && whEvent.sources.length) {
      whState.whSources = whEvent.sources;
      return;
    }

    if (whEvent.type === 'error') {
      throw new Error(whEvent.msg || '知识库问答失败');
    }
  }

  async function whSendMessage() {
    if (whChatPending) {
      return;
    }

    const whQuestion = whInput.value.trim();
    if (!whQuestion) {
      whInput.focus();
      return;
    }

    whHistory.push({ role: 'user', content: whQuestion });
    whAppendMessage('user', whQuestion);
    whInput.value = '';

    const whTyping = whAppendMessage('assistant', '正在检索知识库…');
    whTyping.whBubble.classList.add('wh_kb_bubble--thinking');

    const whState = {
      whBubble: whTyping.whBubble,
      whAnswer: '',
      whThinking: true,
      whSources: []
    };

    whChatPending = true;
    whSendButton.disabled = true;
    whProviderSelect.disabled = true;
    whAbortController = new AbortController();

    const whPayload = {
      provider: whProviderSelect.value,
      messages: whHistory
    };
    console.log('[wh_frontend] 发送给大模型的数据：', whPayload);

    try {
      const whResponse = await fetch('http://localhost:8028/api/kb/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whPayload),
        signal: whAbortController.signal
      });

      if (!whResponse.ok || !whResponse.body) {
        throw new Error(`请求失败，HTTP 状态码 ${whResponse.status}`);
      }

      const whReader = whResponse.body.getReader();
      const whDecoder = new TextDecoder('utf-8');
      let whBuffer = '';

      while (true) {
        const { done: whDone, value: whValue } = await whReader.read();
        if (whDone) {
          break;
        }

        whBuffer += whDecoder.decode(whValue, { stream: true });
        const whBlocks = whBuffer.split('\n\n');
        whBuffer = whBlocks.pop() || '';

        for (const whBlock of whBlocks) {
          whBlock.split('\n').forEach(function whEachLine(whLine) {
            if (whLine.startsWith('data:')) {
              whHandleStreamEvent(whLine.slice(5).trim(), whState);
            }
          });
        }
      }

      whTyping.whBubble.classList.remove('wh_kb_bubble--thinking');

      if (!whState.whAnswer) {
        whState.whAnswer = '（知识库助手暂时没有返回内容，请稍后重试）';
        whTyping.whBubble.textContent = whState.whAnswer;
      }

      if (whState.whSources.length) {
        const whSourceLine = document.createElement('span');
        whSourceLine.className = 'wh_kb_msg_role';
        whSourceLine.textContent = `来源：${whState.whSources.join('、')}`;
        whTyping.whItem.appendChild(whSourceLine);
      }

      whHistory.push({ role: 'assistant', content: whState.whAnswer });
      console.log('[wh_frontend] 知识库助手回答：', whState.whAnswer);
    } catch (whError) {
      console.error('[wh_frontend] 知识库问答失败：', whError);
      whTyping.whBubble.classList.remove('wh_kb_bubble--thinking');
      whTyping.whBubble.classList.add('wh_kb_bubble--error');

      if (whState.whAnswer) {
        whTyping.whBubble.textContent = `${whState.whAnswer}\n\n回复中断：${whError.message}`;
        whHistory.push({ role: 'assistant', content: whState.whAnswer });
      } else {
        whTyping.whBubble.textContent = `请求失败：${whError.message}`;
      }
    } finally {
      whChatPending = false;
      whSendButton.disabled = false;
      whProviderSelect.disabled = false;
      whAbortController = null;
      whInput.focus();
      whScrollToBottom();
    }
  }

  whPickButton.addEventListener('click', function whPickFile() {
    whFileInput.click();
  });

  whFileInput.addEventListener('change', function whShowFileName() {
    const whFile = whFileInput.files && whFileInput.files[0];
    whFileName.textContent = whFile ? whFile.name : '未选择文件';
  });

  whUploadForm.addEventListener('submit', function whHandleUpload(whEvent) {
    whEvent.preventDefault();
    whUpload();
  });

  whChatForm.addEventListener('submit', function whHandleChat(whEvent) {
    whEvent.preventDefault();
    whSendMessage();
  });

  window.addEventListener('pagehide', function whStopStream() {
    if (whAbortController) {
      whAbortController.abort();
    }
  });

  whLoadFiles();
  whInput.focus();
  console.log('[wh_frontend] 知识库页面加载完成');
})();
