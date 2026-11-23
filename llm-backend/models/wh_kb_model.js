/*
 * 姓名：吴欢 | 学号: 24001011028 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 */
const whDbPool = require('../config/wh_db');

async function whCreateFile(whFile) {
  const [whResult] = await whDbPool.execute(
    'INSERT INTO wh_kb_file (wh_name, wh_ext, wh_size, wh_path, wh_chunk_count) VALUES (?, ?, ?, ?, ?)',
    [whFile.name, whFile.ext, whFile.size, whFile.path, whFile.chunkCount]
  );
  return whResult.insertId;
}

async function whInsertChunks(whFileId, whFileName, whChunks) {
  if (!whChunks.length) {
    return;
  }

  const whPlaceholders = whChunks.map(function whBuild() {
    return '(?, ?, ?, ?)';
  }).join(', ');

  const whValues = [];
  whChunks.forEach(function whPush(whChunk, whIndex) {
    whValues.push(whFileId, whFileName, whIndex, whChunk);
  });

  await whDbPool.execute(
    `INSERT INTO wh_kb_chunk (wh_file_id, wh_file_name, wh_chunk_index, wh_content) VALUES ${whPlaceholders}`,
    whValues
  );
}

async function whListFiles() {
  const [whRows] = await whDbPool.execute(
    'SELECT wh_id, wh_name, wh_ext, wh_size, wh_chunk_count, DATE_FORMAT(wh_create_time, \'%Y-%m-%d %H:%i:%s\') AS wh_create_time FROM wh_kb_file ORDER BY wh_id DESC'
  );

  return whRows.map(function whMap(whRow) {
    return {
      id: whRow.wh_id,
      name: whRow.wh_name,
      ext: whRow.wh_ext,
      size: whRow.wh_size,
      chunkCount: whRow.wh_chunk_count,
      createTime: whRow.wh_create_time
    };
  });
}

async function whGetFileById(whFileId) {
  const [whRows] = await whDbPool.execute(
    'SELECT wh_id, wh_name, wh_path FROM wh_kb_file WHERE wh_id = ?',
    [whFileId]
  );
  return whRows[0] || null;
}

async function whDeleteFile(whFileId) {
  await whDbPool.execute('DELETE FROM wh_kb_chunk WHERE wh_file_id = ?', [whFileId]);
  await whDbPool.execute('DELETE FROM wh_kb_file WHERE wh_id = ?', [whFileId]);
}

async function whListAllChunks() {
  const [whRows] = await whDbPool.execute(
    'SELECT wh_id, wh_file_id, wh_file_name, wh_chunk_index, wh_content FROM wh_kb_chunk ORDER BY wh_file_id, wh_chunk_index'
  );

  return whRows.map(function whMap(whRow) {
    return {
      id: whRow.wh_id,
      fileId: whRow.wh_file_id,
      fileName: whRow.wh_file_name,
      chunkIndex: whRow.wh_chunk_index,
      content: whRow.wh_content
    };
  });
}

module.exports = {
  whCreateFile,
  whInsertChunks,
  whListFiles,
  whGetFileById,
  whDeleteFile,
  whListAllChunks
};
