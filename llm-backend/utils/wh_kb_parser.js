/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 知识库文件解析、分片与检索工具
 */
const fs = require('fs');
const path = require('path');
const { parseOffice } = require('officeparser');
const WordExtractor = require('word-extractor');

const WH_SUPPORTED_EXTS = ['.doc', '.docx', '.ppt', '.pptx', '.pdf', '.txt', '.md'];
const WH_CHUNK_SIZE = 180;

function whIsSupported(whExt) {
  return WH_SUPPORTED_EXTS.includes(String(whExt).toLowerCase());
}

function whCleanText(whRawText) {
  return String(whRawText || '')
    .replace(/\r/g, '')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function whParseOfficeFile(whFilePath) {
  const whResult = await parseOffice(whFilePath);
  const whTextResult = await whResult.to('text');
  const whText = typeof whTextResult === 'string' ? whTextResult : whTextResult && whTextResult.value;
  return whCleanText(whText);
}

async function whParseLegacyDoc(whFilePath) {
  const whExtractor = new WordExtractor();
  const whDocument = await whExtractor.extract(whFilePath);
  return whCleanText(whDocument.getBody());
}

async function whParseFile(whFilePath) {
  const whExt = path.extname(whFilePath).toLowerCase();

  if (!whIsSupported(whExt)) {
    throw new Error(`不支持的文件格式：${whExt}，支持 ${WH_SUPPORTED_EXTS.join('、')}`);
  }

  if (whExt === '.txt' || whExt === '.md') {
    return whCleanText(fs.readFileSync(whFilePath, 'utf8'));
  }

  if (whExt === '.doc') {
    return whParseLegacyDoc(whFilePath);
  }

  if (whExt === '.ppt') {
    throw new Error('暂不支持旧版 .ppt，请另存为 .pptx 后再上传');
  }

  return whParseOfficeFile(whFilePath);
}

function whSplitText(whText, whSize) {
  const whChunkSize = whSize || WH_CHUNK_SIZE;
  const whParagraphs = whText
    .split(/\n+/)
    .map(function whTrim(whLine) {
      return whLine.trim();
    })
    .filter(Boolean);

  const whChunks = [];
  let whCurrent = '';

  whParagraphs.forEach(function whAppend(whParagraph) {
    if ((whCurrent + '\n' + whParagraph).trim().length > whChunkSize && whCurrent) {
      whChunks.push(whCurrent.trim());
      whCurrent = whParagraph;
      return;
    }
    whCurrent = whCurrent ? `${whCurrent}\n${whParagraph}` : whParagraph;
  });

  if (whCurrent.trim()) {
    whChunks.push(whCurrent.trim());
  }

  const whResult = [];
  whChunks.forEach(function whSlice(whChunk) {
    if (whChunk.length <= whChunkSize) {
      whResult.push(whChunk);
      return;
    }
    for (let whIndex = 0; whIndex < whChunk.length; whIndex += whChunkSize) {
      whResult.push(whChunk.slice(whIndex, whIndex + whChunkSize));
    }
  });

  return whResult.length ? whResult : [whText];
}

function whTokenize(whQuery) {
  const whClean = String(whQuery || '').replace(/[\s\p{P}\p{S}]/gu, '');
  const whGrams = [];

  if (whClean.length <= 2) {
    if (whClean) {
      whGrams.push(whClean);
    }
    return whGrams;
  }

  for (let whIndex = 0; whIndex < whClean.length - 1; whIndex += 1) {
    const whGram = whClean.slice(whIndex, whIndex + 2);
    if (!whGrams.includes(whGram)) {
      whGrams.push(whGram);
    }
  }
  return whGrams;
}

function whCountOccurrences(whText, whToken) {
  if (!whToken) {
    return 0;
  }
  let whCount = 0;
  let whFrom = 0;
  while (true) {
    const whFound = whText.indexOf(whToken, whFrom);
    if (whFound === -1) {
      break;
    }
    whCount += 1;
    whFrom = whFound + whToken.length;
  }
  return whCount;
}

function whRetrieveChunks(whChunks, whQuery, whTopK) {
  const whGrams = whTokenize(whQuery);
  if (!whGrams.length) {
    return [];
  }

  const whScored = whChunks
    .map(function whScore(whChunk) {
      const whContent = String(whChunk.content || '');
      let whScore = 0;
      whGrams.forEach(function whAdd(whGram) {
        whScore += whCountOccurrences(whContent, whGram);
      });
      return { whChunk, whScore };
    })
    .filter(function whKeep(whItem) {
      return whItem.whScore > 0;
    })
    .sort(function whSort(whLeft, whRight) {
      return whRight.whScore - whLeft.whScore;
    });

  return whScored.slice(0, whTopK || 3).map(function whPick(whItem) {
    return whItem.whChunk;
  });
}

module.exports = {
  WH_SUPPORTED_EXTS,
  whIsSupported,
  whParseFile,
  whSplitText,
  whTokenize,
  whRetrieveChunks
};
