const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const mime = {
  '.html': 'text/html;charset=utf-8',
  '.css': 'text/css;charset=utf-8',
  '.js': 'text/javascript;charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};
http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0] || '/');
  if (url === '/') url = '/index.html';
  let f = path.join(dir, url);
  if (!f.startsWith(dir)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.stat(f, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); res.end('Not found: ' + f); return; }
    fs.readFile(f, (e, d) => {
      if (e) { res.writeHead(500); res.end('Error'); return; }
      res.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' });
      res.end(d);
    });
  });
}).listen(8899, () => console.log('Server: http://localhost:8899'));
