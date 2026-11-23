/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */

(function whInitKefuPage() {
  const WH_KEFU_SYSTEM_PROMPT = [
    '你是“中华美食街”的在线客服小七，只回答以下三类问题：',
    '1. 营业时间：每天 10:00-22:00，节假日照常营业；',
    '2. 招牌菜：麻辣小龙虾、炭火烤串、手工酸辣粉；',
    '3. 配送范围：门店周边 3 公里内，满 30 元起送，配送费 5 元。',
    '除这三类问题外，不回答其他任何内容（包括闲聊、知识问答、写代码、推荐其他商家等），统一礼貌回复：',
    '“抱歉，我只熟悉本街的营业时间、招牌菜和配送范围哦～您的问题已记录，可以留言给人工客服，稍后回复您。”',
    '回答使用简体中文，简短礼貌，不编造未提供的菜单、价格或活动信息。'
  ].join('\n');

  const whCanvas = document.getElementById('wh_kf_canvas');
  const whCtx = whCanvas.getContext('2d');
  const whMessagesBox = document.getElementById('wh_kf_messages');
  const whForm = document.getElementById('wh_kf_form');
  const whInput = document.getElementById('wh_kf_input');
  const whSendButton = document.getElementById('wh_kf_send');
  const whModelLabel = document.getElementById('wh_kf_model');
  const whProviderSelect = document.getElementById('wh_kf_provider');

  const whHistory = [{ role: 'system', content: WH_KEFU_SYSTEM_PROMPT }];
  let whAbortController = null;
  let whPending = false;

  let whWidth = 0;
  let whHeight = 0;
  let whDots = [];
  let whFrameId = null;

  function whBuildDots() {
    const whCount = Math.min(56, Math.max(22, Math.floor((whWidth * whHeight) / 26000)));
    whDots = [];

    for (let whIndex = 0; whIndex < whCount; whIndex += 1) {
      whDots.push({
        whX: Math.random() * whWidth,
        whY: Math.random() * whHeight,
        whR: Math.random() * 1.4 + 0.4,
        whVx: (Math.random() - 0.5) * 0.16,
        whVy: -(Math.random() * 0.24 + 0.06),
        whA: Math.random() * 0.34 + 0.12
      });
    }
  }

  function whResizeCanvas() {
    const whRatio = window.devicePixelRatio || 1;
    whWidth = window.innerWidth;
    whHeight = window.innerHeight;
    whCanvas.width = Math.floor(whWidth * whRatio);
    whCanvas.height = Math.floor(whHeight * whRatio);
    whCanvas.style.width = `${whWidth}px`;
    whCanvas.style.height = `${whHeight}px`;
    whCtx.setTransform(whRatio, 0, 0, whRatio, 0, 0);
    whBuildDots();
  }

  function whDrawFrame() {
    const whGradient = whCtx.createLinearGradient(0, 0, whWidth, whHeight);
    whGradient.addColorStop(0, '#060f14');
    whGradient.addColorStop(0.6, '#0a1a24');
    whGradient.addColorStop(1, '#0b1a1c');
    whCtx.fillStyle = whGradient;
    whCtx.fillRect(0, 0, whWidth, whHeight);

    for (let whIndex = 0; whIndex < whDots.length; whIndex += 1) {
      const whDot = whDots[whIndex];
      whDot.whX += whDot.whVx;
      whDot.whY += whDot.whVy;

      if (whDot.whY < -3) {
        whDot.whY = whHeight + 3;
        whDot.whX = Math.random() * whWidth;
      }
      if (whDot.whX < -3) {
        whDot.whX = whWidth + 3;
      } else if (whDot.whX > whWidth + 3) {
        whDot.whX = -3;
      }

      whCtx.beginPath();
      whCtx.arc(whDot.whX, whDot.whY, whDot.whR, 0, Math.PI * 2);
      whCtx.fillStyle = `rgba(150, 245, 215, ${whDot.whA})`;
      whCtx.fill();
    }

    whFrameId = window.requestAnimationFrame(whDrawFrame);
  }

  function whScrollToBottom() {
    whMessagesBox.scrollTop = whMessagesBox.scrollHeight;
  }

  function whAppendMessage(whRole, whText) {
    const whItem = document.createElement('div');
    whItem.className = `wh_kf_msg wh_kf_msg--${whRole === 'user' ? 'user' : 'ai'}`;

    const whRoleLabel = document.createElement('span');
    whRoleLabel.className = 'wh_kf_msg_role';
    whRoleLabel.textContent = whRole === 'user' ? '我' : '客服小七';

    const whBubble = document.createElement('div');
    whBubble.className = 'wh_kf_bubble';
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

    if (whEvent.type === 'meta' && whEvent.model) {
      whModelLabel.textContent = `${whEvent.model}（${whEvent.provider === 'qiniu' ? '七牛云' : '硅基流动'}）`;
      return;
    }

    if (whEvent.type === 'chunk' && whEvent.content) {
      if (whState.whThinking) {
        whState.whThinking = false;
        whState.whBubble.classList.remove('wh_kf_bubble--thinking');
        whState.whBubble.textContent = '';
      }
      whState.whAnswer += whEvent.content;
      whState.whBubble.textContent = whState.whAnswer;
      whScrollToBottom();
      return;
    }

    if (whEvent.type === 'error') {
      throw new Error(whEvent.msg || '客服返回错误');
    }
  }

  async function whSendMessage() {
    if (whPending) {
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

    const whTyping = whAppendMessage('assistant', '正在输入…');
    whTyping.whBubble.classList.add('wh_kf_bubble--thinking');

    const whState = {
      whBubble: whTyping.whBubble,
      whAnswer: '',
      whThinking: true
    };

    whPending = true;
    whSendButton.disabled = true;
    whProviderSelect.disabled = true;
    whAbortController = new AbortController();

    try {
      const whResponse = await fetch('http://localhost:8028/api/kefu/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: whProviderSelect.value, messages: whHistory }),
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
          const whLines = whBlock.split('\n');
          for (const whLine of whLines) {
            if (!whLine.startsWith('data:')) {
              continue;
            }
            whHandleStreamEvent(whLine.slice(5).trim(), whState);
          }
        }
      }

      whTyping.whBubble.classList.remove('wh_kf_bubble--thinking');

      if (!whState.whAnswer) {
        whState.whAnswer = '（客服暂时没有返回内容，请稍后重试）';
        whTyping.whBubble.textContent = whState.whAnswer;
      }

      whHistory.push({ role: 'assistant', content: whState.whAnswer });
      console.log('[wh_frontend] 客服回复内容：', whState.whAnswer);
    } catch (whError) {
      console.error('[wh_frontend] 在线客服请求失败：', whError);
      whTyping.whBubble.classList.remove('wh_kf_bubble--thinking');
      whTyping.whBubble.classList.add('wh_kf_bubble--error');

      if (whState.whAnswer) {
        whTyping.whBubble.textContent = `${whState.whAnswer}\n\n回复中断：${whError.message}`;
        whHistory.push({ role: 'assistant', content: whState.whAnswer });
      } else {
        whTyping.whBubble.textContent = `请求失败：${whError.message}`;
      }
    } finally {
      whPending = false;
      whSendButton.disabled = false;
      whProviderSelect.disabled = false;
      whAbortController = null;
      whInput.focus();
      whScrollToBottom();
    }
  }

  function whHandleSubmit(whEvent) {
    whEvent.preventDefault();
    whSendMessage();
  }

  whResizeCanvas();
  whDrawFrame();

  whForm.addEventListener('submit', whHandleSubmit);

  window.addEventListener('resize', whResizeCanvas);
  window.addEventListener('pagehide', function whStopAnimation() {
    window.cancelAnimationFrame(whFrameId);
    if (whAbortController) {
      whAbortController.abort();
    }
  });

  whInput.focus();
  console.log('[wh_frontend] 在线客服页面加载完成');
})();
