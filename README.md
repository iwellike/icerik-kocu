# 📱 İçerik Koçu — SE Primer (v2: küçük model)

> Kişiye uyum sağlayan bir "primer": içerik üreticisi oyuncu, viral bir kriz anında 3 sıralı karar verir, her kararın gerçekçi sonucunu görür. AI tutor cevabı söylemez, düşündüren bir soru sorar. **v2:** Karar 1-2'deki davranıştan (süre, karar değiştirme, riskli seçim sayısı) öğrenen küçük bir model, Karar 3'ün ipucu/süre-baskısı davranışını gerçek zamanlı değiştiriyor.

---

## 🎯 Amaç

Bu proje **Mobil Uygulama Geliştirme** dersi "SE Primer" ödevi için geliştirilmiştir. Tam spec için bkz. [`spec.md`](./spec.md).

Fikir, geliştiricinin kendi İçerik Zekâsı (Instagram içerik analizi) projesiyle bağlantılı gerçek bir ihtiyaçtan türetilmiştir: içerik üreticilerinin sık karşılaştığı stratejik kararları (veriye dayalı mı trend'e mi güveneceğim, mahremiyetimi mi gelir mi koruyacağım) güvenli bir ortamda deneyip sonuçlarını görmesi.

## ⚠️ Veri — bilinçli bir ödünleşim

`data/oturumlar.csv` şu an **tamamen sentetik** (`kaynak=sentetik`, 40 oturum, seed=13,
bkz. `data/sentetik_uret.py`). Gerçek oturum toplama mekanizması tam çalışır durumda
(`npm start` ile oynanan her oturum otomatik `kaynak=gercek` olarak loglanır — bkz.
`server.js` → `/api/oturum`), ama zaman kısıtı nedeniyle en az 15 gerçek oturum
toplanmadı. Ödevin kendi kuralı gereği ("Yalnız sentetik veriyle yapılan ödevde Veri
kaleminin yarısı alınır") bu, **bilinçli olarak kabul edilen** bir puan kaybı —
veriyi gerçekmiş gibi göstermek yerine durum olduğu gibi bırakıldı.

## 🔗 Linkler

**v1 (geçen hafta):**
1. **GitHub repo:** https://github.com/iwellike/icerik-kocu
2. **AI Studio uygulaması:** https://icerik-kocu.ai.studio
3. **Demo video:** [`icerik-kocu-demo.gif`](./icerik-kocu-demo.gif) (ekran kaydı — onboarding → Karar 1 → Karar 2 akışı)

**v2 (bu hafta — ödev teslim formunun istediği 4 link):**
1. **GitHub repo:** https://github.com/iwellike/icerik-kocu (branch: `primer-v2-model`)
2. **Hugging Face model (commit'e sabit):** https://huggingface.co/iwellike/icerik-kocu-kotu-son-riski/resolve/857ccb898162f99ae0ba1642b03cb92eb68d1c08/model.onnx (repo: https://huggingface.co/iwellike/icerik-kocu-kotu-son-riski)
3. **Canlı uygulama (web):** yerel prototip, aşağıdaki "Yerel Prototipi Çalıştırma"
4. **Demo video (v2):** `cypress/videos/model.cy.js.mp4` + ayrı bir ekran kaydı (bkz. aşağıda "Demo Video")

## 🧩 Pipeline

**Google Stitch** (3 ekran tasarımı → [`DESIGN.md`](./DESIGN.md), [`design/`](./design)) → **Google AI Studio** (gerçek Gemini destekli çalışan uygulama → [`ai-studio-prompt.md`](./ai-studio-prompt.md)) → **Cypress** (tüm yollar E2E + demo video).

## 🖥️ Akış (3 ekran tipi)

1. **Giriş** — 3 soru: seviye, rol, hedef. Anlatı ve zorluk buna göre uyarlanır.
2. **Sahne/Karar** — tek senaryo, 3 sıralı karar (Strateji → Doğrulama → Mahremiyet). "Yeni başlıyorum" ipucu gösterir, "Deneyimliyim" 60 saniyelik süre baskısı uygular. Her karardan sonra oyuncu yansımasını yazar, AI tutor (Gemini) buna düşündüren bir soruyla yanıt verir — doğru cevabı söylemez.
3. **Son** — toplam puana (0-3) göre 2 farklı son (İyi/Kötü), puan şeffaf gösterilir.

Detaylı akış şeması ve kabul örnekleri için [`spec.md`](./spec.md).

## 🚀 Yerel Prototipi Çalıştırma

> Not: Yerel prototip (`app.js`) AI tutor adımını sabit örnek metinlerle simüle eder — gerçek Gemini çağrısı yalnızca AI Studio uygulamasında çalışır. Yerel prototip; Cypress testleri ve tasarım/akış doğrulaması için kullanılır.

Gereksinim: [Node.js](https://nodejs.org/) (v18+)

```bash
cd icerik-kocu
npm install
npm start
```

Tarayıcıda aç: `http://localhost:5173`

## ✅ Testler (Cypress)

Uygulama ayaktayken (`npm start`), başka bir terminalde:

```bash
npm run cy:run      # headless çalıştırır, video üretir (cypress/videos/)
npm run cy:open     # test arayüzünü açar
```

`cypress/e2e/app.cy.js`, 3 karar x 2 seçenek'in **tüm 8 kombinasyonunu** (her biri doğru sona ulaştığını doğrulayarak) + "Deneyimliyim" süre baskısı davranışını + sıfırlamayı E2E test eder (**regresyon**, v2 ile birlikte hâlâ geçiyor).

`cypress/e2e/model.cy.js` (**v2**): (a) **diferansiyel test** — tarayıcıdaki ONNX çıkarımı (`data-cy="p"` / `window.__onnxTahminEt`) ile Python oracle'ın (`tests/parite.py`) ürettiği `tests/parite.json` değerlerini `1e-4` toleransla karşılaştırır; (b) Karar 1-2'de iki kez riskli seçilince Karar 3'ün ipucu/süre davranışının değiştiğini, iki kez veri-odaklı seçilince değişmediğini doğrular (spec.md kabul örnek 6-7).

## 🤖 v2 — Model (eğitim, eval kapısı, ONNX, parite)

```bash
uv venv --python 3.12 .venv
uv pip install --python .venv -r requirements.txt
.venv/Scripts/python train.py        # data/oturumlar.csv → model/model.onnx + config.json (eşik altındaysa durur)
.venv/Scripts/python tests/parite.py # 5 referans girdi → tests/parite.json (Python oracle)
```

Gerçek oturum verisi `npm start` ile oynanan oturumlardan otomatik toplanır (`server.js` →
`data/oturumlar.csv`, `kaynak=gercek`). Sentetik veri için: `.venv/Scripts/python data/sentetik_uret.py`
(seed=13, kural `data/sentetik_uret.py` docstring'inde). Model kartı: [`model/README.md`](./model/README.md).
Sürümleme, ödünleşim matrisi, rollback ve güvenli devreye alma planı: [`RELEASE.md`](./RELEASE.md).
Vize hazırlık düşünce egzersizi: [`SINAV_TASARIMI.md`](./SINAV_TASARIMI.md).

## 📁 Proje Yapısı

```
icerik-kocu/
├── spec.md                ← problem, kapsam, 8 kabul örneği, akış şeması, v2 model spec'i
├── SINAV_TASARIMI.md       ← vize hazırlık düşünce egzersizi
├── RELEASE.md              ← v2 sürüm notu, ödünleşim matrisi, shadow/canary/rollback
├── DESIGN.md               ← Stitch ekranları + tasarım kararları
├── design/                 ← Stitch'ten dışa aktarılan 3 ekran görseli
├── stitch-prompt.md        ← Stitch'e yapıştırılan prompt
├── ai-studio-prompt.md     ← AI Studio'ya yapıştırılan build prompt'u
├── tutor-eval.md           ← AI tutor'un 20 örnek cevaba verdiği yanıtların değerlendirmesi
├── index.html / style.css / app.js   ← yerel prototip (v2: onnxruntime-web entegrasyonu)
├── server.js               ← statik sunucu (Node http) + /api/oturum (gerçek oturum loglama)
├── requirements.txt, train.py        ← v2: eğitim + eval kapısı + ONNX export
├── data/
│   ├── oturumlar.csv       ← her karar bir satır (kaynak=gercek|sentetik)
│   ├── SOZLUK.md           ← veri sözlüğü
│   └── sentetik_uret.py    ← dokümante, seed'li sentetik veri üretici
├── model/
│   ├── model.onnx, config.json      ← sözleşme + taşınabilir model
│   └── README.md           ← model kartı
├── tests/
│   ├── parite.py           ← Python oracle
│   └── parite.json         ← 5 referans girdi + oracle olasılığı
├── server/                 ← bonus: FastAPI consumer (bkz. RELEASE.md)
├── cypress.config.js
└── cypress/e2e/
    ├── app.cy.js           ← v1 regresyon (8 yol + süre baskısı + reset)
    └── model.cy.js         ← v2: diferansiyel test + davranış değişikliği
```

## 🧪 Gerçek Kullanıcı Testi

Bkz. [`kullanici-testi-raporu.md`](./kullanici-testi-raporu.md).

## 🎬 Demo Video

- [`icerik-kocu-demo.gif`](./icerik-kocu-demo.gif) — v1 ekran kaydı (onboarding → Karar 1 → Karar 2).
- `cypress/videos/app.cy.js.mp4` — v1 regresyon: tüm 8 yolu ve süre-baskısı davranışını gösterir.
- `cypress/videos/model.cy.js.mp4` — **v2**: aynı sahnede (Karar 3) modelin iki farklı oyuncu için
  iki farklı karar verdiğini gösterir — riskli/hızlı patika → ipucu zorla açılır + süre kalkar;
  veri-odaklı/düşünerek patika → v1 davranışı (seviyeye bağlı) sürer.

## 🧭 Ürün Kararı — Yapmadığım 3 Özellik

1. **Kullanıcı hesabı/girişi eklemedim** çünkü MVP'nin değerlendirme hedefi kimlik doğrulama değil, karar-sonuç döngüsünün kendisi.
2. **İkinci bir senaryo/bölüm eklemedim** çünkü kapsamı tek bir krizde derinleştirmek, yüzeysel çoklu senaryodan daha güçlü bir "kabul örneği" seti üretiyor.
3. **Native mobil uygulama yapmadım** çünkü tek bir AI Studio linkiyle telefon tarayıcısından anında oynanabilir olması, store'a yüklemeden "baştan sona oynanır" kriterini daha hızlı karşılıyor.

## 🤝 v2 — AI Aracı Kullanımı (beyan)

v2'nin tamamı **Claude Code** ile, görevi devrederek (`"gereken her şeyi yap"`) geliştirildi;
süreci şeffaf bırakmak için nerede/nasıl kullanıldığı aşağıda:

1. **Spec + model tasarımı:** Hedef (kötü-son-riski vs. ödevin taban örneği ipucu-gerekli-mi)
   ve özellik seti (karar süresi, karar değiştirme, riskli sayısı) ödevin kendi ilham
   listesinden bilerek seçildi, taban örnek olduğu gibi kopyalanmadı (bkz. `spec.md`).
2. **Veri + eğitim boru hattı:** `data/sentetik_uret.py`, `train.py`, ONNX export/eşdeğerlik
   kontrolü Claude Code tarafından yazıldı. İlk sentetik veri (14 oturum) eval eşiğini
   (accuracy≥0.70) geçemedi — **elle düzeltme**: oturum sayısı 40'a çıkarıldı ve persona
   gürültüsü (`std`) azaltıldı; `random_state`/seed hiç değiştirilmedi (bkz. `SINAV_TASARIMI.md`
   — tohum avcılığı yerine veri tasarımı iyileştirildi).
3. **Web entegrasyonu + hata ayıklama:** `onnxruntime-web` entegrasyonunda üç gerçek bug
   Cypress ile bulunup düzeltildi: (a) `openKarar`'da `kararOnaylandi` bayrağının sıfırlanmaması
   (Karar 2'den sonra seçenekler kilitleniyordu); (b) eksik `wasmPaths`/`numThreads` ayarı ve
   Cypress'in varsayılan 4s komut zaman aşımının model yüklenme süresinden (~5-7s) kısa kalması;
   (c) **en önemlisi** — Karar 2→3 geçişinin model çağrısını `await` ile bloke etmesi: bu,
   seviyeden bağımsız **her oyuncuyu** gereksiz yere birkaç saniye bekletiyordu (gerçek bir UX
   hatası, yalnız test artefaktı değil). Düzeltme: geçiş artık anında açılır (v1 davranışıyla),
   model sonucu gelince (hâlâ Karar 3'teyse) ipucu/süre canlı güncellenir (`karar3OverrideCanliUygula`).
4. **Cypress testleri:** `model.cy.js`'deki "veri-odaklı seçim" testi ilk yazımda anlık/düşünmeden
   tıklamayı simüle ediyordu; model karar süresini de kullandığından yanlış pozitif üretti —
   **elle düzeltme**: test, modelin sınırları (`model/README.md`) ışığında gerçekçi bir
   "düşünerek seçen" oyuncuya göre yeniden yazıldı, kabul örneği (`spec.md` #7) de netleştirildi.
5. **RELEASE.md / model kartı / SINAV_TASARIMI.md:** ilk taslaklar Claude Code tarafından
   yazıldı; ödünleşim matrisi ve shadow/canary senaryosu bu projenin tek-kullanıcılı/demo
   ölçeğine (gerçek trafik bölümleme altyapısı yok) uyacak şekilde somutlaştırıldı.

## 👩‍💻 Öğrenci Bilgileri

- **Ad Soyad:** Melike Tıkır
- **Öğrenci No:** 231118022
- **E-posta:** meliketikir012@gmail.com

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
