/*
 * 作者: 吴欢
 * 建立时间: 2026-11-12 13:46
 * 使用模型: GLM-5.3-Flash
 * 功能名称及简介: 诗歌数据服务器 - 读取 db/db.json，通过 /api/poems 返回诗歌数据、
 *                 通过 /api/authors 返回作者列表（均以 JSON 返回并开启 CORS 允许跨域）；
 *                 /api/img?url=xxx 把 poems 里的远程图片经本地服务器转发
 *                 （解决直接外链被防盗链拦截的问题）；同时把项目根目录作为静态目录，
 *                 可直接用 http://localhost:3004/wh_poems.html 打开页面。
 *                 端口号为 3004，启动命令：node db/server.js
 */

var wh_http = require("http");
var wh_https = require("https");
var wh_fs = require("fs");
var wh_path = require("path");
var wh_urlLib = require("url");

/** 服务端口号（任务要求 3004） */
var wh_port = 3004;

/** 静态文件根目录：server.js 位于 db/ 内，项目根目录为其上一级 */
var wh_root = wh_path.join(__dirname, "..");

/** 数据文件路径：db.json 与 server.js 同目录 */
var wh_dbFile = wh_path.join(__dirname, "db.json");

/** 常见文件的 MIME 类型映射 */
var wh_mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".md": "text/plain; charset=utf-8"
};

/**
 * 功能: wh_readDb
 * 简介: 读取并解析 db.json，返回完整数据对象；文件缺失或 JSON 格式错误时返回
 *       只含空数组的兜底对象，保证接口不会因为数据问题而使服务器崩溃。
 * 作者: 吴欢
 * 建立时间: 2026-11-16 12:53
 * 使用模型: DeepSeek-V4.1-Flash
 */
function wh_readDb() {
  try {
    var wh_raw = wh_fs.readFileSync(wh_dbFile, "utf8");
    var wh_data = JSON.parse(wh_raw);
    return {
      poems: Array.isArray(wh_data.poems) ? wh_data.poems : [],
      authors: Array.isArray(wh_data.authors) ? wh_data.authors : []
    };
  } catch (wh_err) {
    console.error("[db] 读取 db.json 失败: " + wh_err.message);
    return { poems: [], authors: [] };
  }
}

/**
 * 功能: wh_readPoems
 * 简介: 返回 db.json 中的 poems 数组（诗歌数据，字段为 pic / title / content / author）。
 * 作者: 吴欢
 * 建立时间: 2026-11-12 13:46
 * 使用模型: GLM-5.3-Flash
 */
function wh_readPoems() {
  return wh_readDb().poems;
}

/**
 * 功能: wh_readAuthors
 * 简介: 返回 db.json 中的 authors 数组（作者数据，字段为 id / name / dynasty / intro），
 *       与 poems 的 author 字段按姓名关联。
 * 作者: 吴欢
 * 建立时间: 2026-11-16 12:53
 * 使用模型: DeepSeek-V4.1-Flash
 */
function wh_readAuthors() {
  return wh_readDb().authors;
}

/**
 * 功能: wh_sendJson
 * 简介: 以 JSON 格式响应请求，统一附加 CORS 头（Access-Control-Allow-Origin: *），
 *       这样页面即使以 file:// 方式打开也能跨域获取数据。
 * 作者: 吴欢
 * 建立时间: 2026-11-12 13:46
 * 使用模型: GLM-5.3-Flash
 */
function wh_sendJson(wh_res, wh_code, wh_obj) {
  var wh_body = JSON.stringify(wh_obj);
  wh_res.writeHead(wh_code, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*"
  });
  wh_res.end(wh_body);
}

/**
 * 功能: wh_serveStatic
 * 简介: 按请求路径在项目根目录下查找静态文件并返回；访问 / 时默认返回 wh_poems.html。
 *       对路径做规范化与越界检查，防止通过 .. 访问根目录之外的文件。
 * 作者: 吴欢
 * 建立时间: 2026-11-12 13:46
 * 使用模型: GLM-5.3-Flash
 */
function wh_serveStatic(wh_req, wh_res, wh_urlPath) {
  if (wh_urlPath === "/") {
    wh_urlPath = "/wh_poems.html";
  }

  var wh_filePath = wh_path.join(wh_root, wh_urlPath);

  // 防目录穿越：解析后的真实路径必须仍在项目根目录内
  if (wh_filePath.indexOf(wh_root) !== 0) {
    wh_res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    return wh_res.end("403 Forbidden");
  }

  wh_fs.readFile(wh_filePath, function (wh_err, wh_data) {
    if (wh_err) {
      wh_res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return wh_res.end("404 Not Found: " + wh_urlPath);
    }
    var wh_type = wh_mime[wh_path.extname(wh_filePath).toLowerCase()] || "application/octet-stream";
    wh_res.writeHead(200, { "Content-Type": wh_type });
    wh_res.end(wh_data);
  });
}

/**
 * 功能: wh_fetchImage
 * 简介: 按目标地址发起 http(s) 请求，收到 30x 重定向时自动跟随（最多 3 次），
 *       最终把图片响应流交给回调 wh_cb(wh_upRes)。gitee 的 raw 地址会 302 到
 *       带签名的 raw.giteeusercontent.com CDN 地址，因此必须跟随重定向才能拿到图片。
 * 作者: 吴欢
 * 建立时间: 2026-11-12 13:46
 * 使用模型: GLM-5.3-Flash
 */
function wh_fetchImage(wh_target, wh_cb, wh_retries) {
  if (typeof wh_retries === "undefined") {
    wh_retries = 3;
  }
  var wh_module = wh_target.indexOf("https://") === 0 ? wh_https : wh_http;
  var wh_req = wh_module.get(wh_target, function (wh_upRes) {
    if (wh_upRes.statusCode >= 300 && wh_upRes.statusCode < 400 && wh_upRes.headers.location && wh_retries > 0) {
      // 30x：跟随 Location 重新请求（重定向后的地址必定带协议）
      wh_upRes.resume();
      return wh_fetchImage(wh_upRes.headers.location, wh_cb, wh_retries - 1);
    }
    wh_cb(wh_upRes);
  });
  wh_req.on("error", function () {
    wh_cb(null);
  });
}

/**
 * 功能: wh_proxyImage
 * 简介: 图片代理接口。接收 ?url= 参数（需为 http/https 地址），经 wh_fetchImage
 *       把远程图片（自动跟随重定向）请求回来再转发给浏览器，使 poems 里的远程图片
 *       也"通过本地服务器获取"，同时规避 gitee 等图床对直接外链的防盗链限制。
 * 作者: 吴欢
 * 建立时间: 2026-11-12 13:46
 * 使用模型: GLM-5.3-Flash
 */
function wh_proxyImage(wh_req, wh_res, wh_query) {
  var wh_parsed = wh_urlLib.parse(wh_req.url, true);
  var wh_target = wh_parsed.query.url;

  if (!wh_target || !/^https?:\/\//i.test(wh_target)) {
    wh_res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    return wh_res.end("400 Bad Request: url 参数必须是 http/https 图片地址");
  }

  wh_fetchImage(wh_target, function (wh_upRes) {
    if (!wh_upRes) {
      wh_res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
      return wh_res.end("502 Bad Gateway: 拉取远程图片失败");
    }
    wh_res.writeHead(wh_upRes.statusCode === 200 ? 200 : 502, {
      "Content-Type": wh_upRes.headers["content-type"] || "image/jpeg",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400"
    });
    wh_upRes.pipe(wh_res);
  });
}

/**
 * 功能: wh_server（主服务）
 * 简介: 创建 http 服务器并监听 3004 端口。路由规则：
 *       GET /api/poems      -> 返回 db.json 的 poems 数据（JSON + CORS）；
 *       GET /api/authors    -> 返回 db.json 的 authors 作者列表（JSON + CORS）；
 *       GET /api/img?url=xx -> 图片代理，转发 poems 里的远程图片；
 *       其余路径            -> 按静态文件处理（/ 默认返回 wh_poems.html）。
 * 作者: 吴欢
 * 建立时间: 2026-11-12 13:46
 * 使用模型: GLM-5.3-Flash
 */
var wh_server = wh_http.createServer(function (wh_req, wh_res) {
  var wh_url = "";
  try {
    wh_url = decodeURIComponent(wh_req.url.split("?")[0]);
  } catch (wh_err) {
    wh_url = "/";
  }

  console.log("[wh-server] " + wh_req.method + " " + wh_url);

  if (wh_url === "/api/poems") {
    return wh_sendJson(wh_res, 200, { code: 0, data: wh_readPoems() });
  }

  if (wh_url === "/api/authors") {
    return wh_sendJson(wh_res, 200, { code: 0, data: wh_readAuthors() });
  }

  if (wh_url === "/api/img") {
    return wh_proxyImage(wh_req, wh_res, wh_req.url);
  }

  return wh_serveStatic(wh_req, wh_res, wh_url);
});

wh_server.listen(wh_port, "127.0.0.1", function () {
  console.log("[wh-server] 诗歌数据服务器已启动: http://localhost:" + wh_port);
  console.log("[wh-server] 诗歌接口:        http://localhost:" + wh_port + "/api/poems");
  console.log("[wh-server] 作者接口:        http://localhost:" + wh_port + "/api/authors");
  console.log("[wh-server] 页面入口:        http://localhost:" + wh_port + "/wh_poems.html");
  console.log("[wh-server] 按 Ctrl+C 可停止服务器");
});
