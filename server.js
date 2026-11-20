// Minimal static file server for cctechapps.com (no dependencies).
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8080);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};
const PUBLIC = new Set(["index.html"]);

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p === "/health") return res.end("ok");
    if (p === "/" || p === "/apps.html") p = "/index.html";
    const rel = path.normalize(p).replace(/^[/\\]+/, "");
    const allowed = PUBLIC.has(rel) || rel.startsWith("assets" + path.sep) || rel.startsWith("assets/");
    const file = path.join(ROOT, rel);
    if (!allowed || !file.startsWith(ROOT)) {
      res.writeHead(302, { Location: "/" });
      return res.end();
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(302, { Location: "/" });
        return res.end();
      }
      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": ext === ".html" ? "public, max-age=300" : "public, max-age=604800",
      });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log(`cctechapps.com listening on ${PORT}`));
