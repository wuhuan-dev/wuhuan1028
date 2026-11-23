/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */

(function whInitVisionPage() {
  const whFileInput = document.getElementById('wh_vs_file');
  const whPickButton = document.getElementById('wh_vs_pick');
  const whSubmitButton = document.getElementById('wh_vs_submit');
  const whForm = document.getElementById('wh_vs_form');
  const whPreview = document.getElementById('wh_vs_preview');
  const whImage = document.getElementById('wh_vs_image');
  const whPlaceholder = document.getElementById('wh_vs_placeholder');
  const whFileName = document.getElementById('wh_vs_filename');
  const whStatus = document.getElementById('wh_vs_status');
  const whResult = document.getElementById('wh_vs_result');
  const whModelLabel = document.getElementById('wh_vs_model');

  let whPreviewUrl = '';
  let whBusy = false;

  function whResetResult() {
    whResult.classList.remove('wh_vs_result--loading', 'wh_vs_result--error');
    whResult.innerHTML = '<p class="wh_vs_result_empty">模型对图片的描述会显示在这里</p>';
  }

  function whSetResult(whText, whState) {
    whResult.classList.remove('wh_vs_result--loading', 'wh_vs_result--error');
    if (whState === 'loading' || whState === 'error') {
      whResult.classList.add(`wh_vs_result--${whState}`);
    }
    whResult.innerHTML = '';
    const whParagraph = document.createElement('p');
    whParagraph.className = 'wh_vs_result_empty';
    whParagraph.textContent = whText;
    whResult.appendChild(whParagraph);
  }

  function whShowPreview() {
    const whFile = whFileInput.files && whFileInput.files[0];
    if (!whFile) {
      whFileName.textContent = '未选择图片';
      return;
    }

    whFileName.textContent = `${whFile.name}（${(whFile.size / 1024).toFixed(0)} KB）`;
    whPlaceholder.hidden = true;
    whImage.hidden = false;

    if (whPreviewUrl) {
      URL.revokeObjectURL(whPreviewUrl);
    }
    whPreviewUrl = URL.createObjectURL(whFile);
    whImage.src = whPreviewUrl;
    whStatus.textContent = '图片已选择，点击“开始识别”';
    whResetResult();
  }

  async function whRecognize() {
    if (whBusy) {
      return;
    }

    const whFile = whFileInput.files && whFileInput.files[0];
    if (!whFile) {
      whStatus.textContent = '请先点击“选择图片”';
      return;
    }

    whBusy = true;
    whSubmitButton.disabled = true;
    whPickButton.disabled = true;
    whStatus.textContent = '正在识别图像…';
    whSetResult('正在识别图像…', 'loading');

    const whFormData = new FormData();
    whFormData.append('image', whFile);
    console.log('[wh_frontend] 发送给大模型的数据：', {
      api: 'http://localhost:8028/api/vision/describe',
      fileName: whFile.name,
      fileSize: whFile.size,
      mime: whFile.type
    });

    try {
      const whResponse = await fetch('http://localhost:8028/api/vision/describe', { method: 'POST', body: whFormData });
      const whResultJson = await whResponse.json();
      console.log('[wh_frontend] 接收自大模型的数据：', whResultJson);

      if (whResultJson.code !== 0) {
        throw new Error(whResultJson.msg || '图像识别失败');
      }

      if (whResultJson.data.model) {
        whModelLabel.textContent = whResultJson.data.model;
      }

      whResult.classList.remove('wh_vs_result--loading');
      whResult.textContent = whResultJson.data.description || '（模型没有返回描述）';
      whStatus.textContent = '识别完成';
    } catch (whError) {
      console.error('[wh_frontend] 图像识别失败：', whError);
      whSetResult(`识别失败：${whError.message}`, 'error');
      whStatus.textContent = '识别失败，可更换图片后重试';
    } finally {
      whBusy = false;
      whSubmitButton.disabled = false;
      whPickButton.disabled = false;
    }
  }

  whPickButton.addEventListener('click', function whPick() {
    whFileInput.click();
  });

  whFileInput.addEventListener('change', whShowPreview);

  whForm.addEventListener('submit', function whSubmit(whEvent) {
    whEvent.preventDefault();
    whRecognize();
  });

  window.addEventListener('pagehide', function whCleanup() {
    if (whPreviewUrl) {
      URL.revokeObjectURL(whPreviewUrl);
    }
  });

  console.log('[wh_frontend] 图像识别页面加载完成');
})();
