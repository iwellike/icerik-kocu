const http = require("http");
const fs = require("fs");
const path = require("path");

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
const PORT = 5173;

http
  .createServer((req, res) => {
    const file = req.url === "/" ? "/index.html" : req.url;
    const filePath = path.join(__dirname, file);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "text/plain" });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log(`http://localhost:${PORT}`));
