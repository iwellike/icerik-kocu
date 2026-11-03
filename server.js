const http = require("http");
const fs = require("fs");
const path = require("path");

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
const PORT = 5173;
const CSV_PATH = path.join(__dirname, "data", "oturumlar.csv");
const CSV_FIELDS = [
  "oturum_id", "kaynak", "seviye", "rol", "hedef", "sahne_no",
  "karar_suresi_sn", "karar_degisikligi_sayisi", "riskli_sayisi_simdiye_kadar", "kotu_son",
];

function csvKac(deger) {
  const s = String(deger);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Gerçek oyun oturumlarını data/oturumlar.csv'ye ekler (kaynak=gercek). app.js, bir oturum
// bitince (showSon) bu endpoint'e POST atar; Cypress koşuları bunu tetiklemez (window.Cypress guard'ı).
function oturumuKaydet(satirlar) {
  const yeniDosya = !fs.existsSync(CSV_PATH);
  const gövde = satirlar.map((r) => CSV_FIELDS.map((f) => csvKac(r[f])).join(",")).join("\n");
  const baslik = yeniDosya ? CSV_FIELDS.join(",") + "\n" : "";
  fs.appendFileSync(CSV_PATH, baslik + gövde + "\n");
}

http
  .createServer((req, res) => {
    if (req.method === "POST" && req.url === "/api/oturum") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const { satirlar } = JSON.parse(body);
          if (Array.isArray(satirlar) && satirlar.length > 0) oturumuKaydet(satirlar);
          res.writeHead(204);
          res.end();
        } catch {
          res.writeHead(400);
          res.end();
        }
      });
      return;
    }

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
