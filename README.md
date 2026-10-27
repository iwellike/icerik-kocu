# 📱 İçerik Koçu — SE Primer

> Kişiye uyum sağlayan bir "primer": içerik üreticisi oyuncu, viral bir kriz anında 3 sıralı karar verir, her kararın gerçekçi sonucunu görür. AI tutor cevabı söylemez, düşündüren bir soru sorar.

---

## 🎯 Amaç

Bu proje **Mobil Uygulama Geliştirme** dersi "SE Primer" ödevi için geliştirilmiştir. Tam spec için bkz. [`spec.md`](./spec.md).

Fikir, geliştiricinin kendi İçerik Zekâsı (Instagram içerik analizi) projesiyle bağlantılı gerçek bir ihtiyaçtan türetilmiştir: içerik üreticilerinin sık karşılaştığı stratejik kararları (veriye dayalı mı trend'e mi güveneceğim, mahremiyetimi mi gelir mi koruyacağım) güvenli bir ortamda deneyip sonuçlarını görmesi.

## 🔗 Üç Link

1. **GitHub repo:** https://github.com/iwellike/icerik-kocu
2. **AI Studio uygulaması:** https://icerik-kocu.ai.studio
3. **Demo video:** <!-- cypress/videos/app.cy.js.mp4 dosyasını (veya yüklediğin yeri) buraya bağla -->

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

`cypress/e2e/app.cy.js`, 3 karar x 2 seçenek'in **tüm 8 kombinasyonunu** (her biri doğru sona ulaştığını doğrulayarak) + "Deneyimliyim" süre baskısı davranışını + sıfırlamayı E2E test eder.

## 📁 Proje Yapısı

```
icerik-kocu/
├── spec.md              ← problem, kapsam, 5 kabul örneği, akış şeması
├── DESIGN.md             ← Stitch ekranları + tasarım kararları
├── design/                ← Stitch'ten dışa aktarılan 3 ekran görseli
├── stitch-prompt.md       ← Stitch'e yapıştırılan prompt
├── ai-studio-prompt.md    ← AI Studio'ya yapıştırılan build prompt'u
├── tutor-eval.md          ← AI tutor'un 20 örnek cevaba verdiği yanıtların değerlendirmesi
├── index.html / style.css / app.js   ← yerel prototip
├── server.js              ← bağımlılıksız statik sunucu (Node http)
├── cypress.config.js
└── cypress/e2e/app.cy.js
```

## 🧪 Gerçek Kullanıcı Testi

Bkz. [`kullanici-testi-raporu.md`](./kullanici-testi-raporu.md).

## 🎬 Demo Video

Cypress'in `cy:run` sırasında otomatik ürettiği video: `cypress/videos/app.cy.js.mp4` — tüm 8 yolu ve süre-baskısı davranışını gösterir.

## 🧭 Ürün Kararı — Yapmadığım 3 Özellik

1. **Kullanıcı hesabı/girişi eklemedim** çünkü MVP'nin değerlendirme hedefi kimlik doğrulama değil, karar-sonuç döngüsünün kendisi.
2. **İkinci bir senaryo/bölüm eklemedim** çünkü kapsamı tek bir krizde derinleştirmek, yüzeysel çoklu senaryodan daha güçlü bir "kabul örneği" seti üretiyor.
3. **Native mobil uygulama yapmadım** çünkü tek bir AI Studio linkiyle telefon tarayıcısından anında oynanabilir olması, store'a yüklemeden "baştan sona oynanır" kriterini daha hızlı karşılıyor.

## 👩‍💻 Öğrenci Bilgileri

- **Ad Soyad:** Melike Tıkır
- **Öğrenci No:** 231118022
- **E-posta:** meliketikir012@gmail.com

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
