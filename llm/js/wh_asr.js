/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */

(function whInitAsrPage() {
  const whFileInput = document.getElementById('wh_asr_file');
  const whPickButton = document.getElementById('wh_asr_pick');
  const whSubmitButton = document.getElementById('wh_asr_submit');
  const whForm = document.getElementById('wh_asr_form');
  const whFileName = document.getElementById('wh_asr_filename');
  const whPlaceholder = document.getElementById('wh_asr_placeholder');
  const whPlayer = document.getElementById('wh_asr_player');
  const whStatus = document.getElementById('wh_asr_status');
  const whResult = document.getElementById('wh_asr_result');
  const whCopyButton = document.getElementById('wh_asr_copy');

  let whAudioUrl = '';
  let whCurrentText = '';
  let whBusy = false;

  function whSetResult(whText, whState) {
    whResult.classList.remove('wh_asr_result--loading', 'wh_asr_result--error');
    if (whState === 'loading' || whState === 'error') {
      whResult.classList.add(`wh_asr_result--${whState}`);
    }
    whResult.innerHTML = '';
    const whParagraph = document.createElement('p');
    whParagraph.className = 'wh_asr_result_empty';
    whParagraph.textContent = whText;
    whResult.appendChild(whParagraph);
  }

  function whResetResult() {
    whCurrentText = '';
    whCopyButton.disabled = true;
    whSetResult('语音转换出的文字会显示在这里');
  }

  function whShowFile() {
    const whFile = whFileInput.files && whFileInput.files[0];
    if (!whFile) {
      whFileName.value = '未选择音频';
      return;
    }

    whFileName.value = `${whFile.name}（${(whFile.size / 1024).toFixed(0)} KB）`;
    whPlaceholder.hidden = true;
    whPlayer.hidden = false;

    if (whAudioUrl) {
      URL.revokeObjectURL(whAudioUrl);
    }
    whAudioUrl = URL.createObjectURL(whFile);
    whPlayer.src = whAudioUrl;
    whStatus.textContent = '音频已选择，点击“开始识别”';
    whResetResult();
  }

  async function whTranscribe() {
    if (whBusy) {
      return;
    }

    const whFile = whFileInput.files && whFileInput.files[0];
    if (!whFile) {
      whStatus.textContent = '请先点击“选择音频”';
      return;
    }

    whBusy = true;
    whSubmitButton.disabled = true;
    whPickButton.disabled = true;
    whStatus.textContent = '正在识别语音…';
    whSetResult('正在识别语音…', 'loading');

    const whFormData = new FormData();
    whFormData.append('audio', whFile);

    console.log('[wh_frontend] 发送给大模型的数据：', {
      api: 'http://localhost:8028/api/asr/transcribe',
      fileName: whFile.name,
      fileSize: whFile.size,
      mime: whFile.type
    });

    try {
      const whResponse = await fetch('http://localhost:8028/api/asr/transcribe', { method: 'POST', body: whFormData });
      const whResultJson = await whResponse.json();
      console.log('[wh_frontend] 接收自大模型的数据：', whResultJson);

      if (whResultJson.code !== 0) {
        throw new Error(whResultJson.msg || '语音识别失败');
      }

      whCurrentText = whResultJson.data.text || '';
      whResult.classList.remove('wh_asr_result--loading');
      whResult.textContent = whCurrentText || '（没有识别到文字，请确认音频中有清晰语音）';
      whCopyButton.disabled = !whCurrentText;
      whStatus.textContent = '识别完成';
    } catch (whError) {
      console.error('[wh_frontend] 语音识别失败：', whError);
      whSetResult(`识别失败：${whError.message}`, 'error');
      whStatus.textContent = '识别失败，可更换音频后重试';
    } finally {
      whBusy = false;
      whSubmitButton.disabled = false;
      whPickButton.disabled = false;
    }
  }

  whPickButton.addEventListener('click', function whPick() {
    whFileInput.click();
  });

  whFileInput.addEventListener('change', whShowFile);

  whForm.addEventListener('submit', function whSubmit(whEvent) {
    whEvent.preventDefault();
    whTranscribe();
  });

  whCopyButton.addEventListener('click', async function whCopy() {
    if (!whCurrentText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(whCurrentText);
      whStatus.textContent = '识别文字已复制到剪贴板';
    } catch (whError) {
      console.error('[wh_frontend] 复制失败：', whError);
      whStatus.textContent = '复制失败，请手动选择文字复制';
    }
  });

  window.addEventListener('pagehide', function whCleanup() {
    if (whAudioUrl) {
      URL.revokeObjectURL(whAudioUrl);
    }
  });

  console.log('[wh_frontend] 语音识别页面加载完成');
})();
