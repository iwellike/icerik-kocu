# 📱 İçerik Koçu — Kişiselleştirilmiş Öğrenme Uygulaması

> İçerik üreticilerine, karşılaştığı gerçek dilemmaları (erişim düşüşü, viral an, veri mahremiyeti, platform kesintisi) seçimli senaryolarla sunan; cevabı dayatmadan düşünmeye ve araştırmaya yönlendiren mobil web uygulaması.

---

## 🎯 Amaç

Bu proje **Mobil Uygulama Geliştirme** dersi kapsamındaki "kişiselleştirilmiş öğrenme uygulaması" ödevi için geliştirilmiştir. Uygulama, kullanıcıyı yargılamadan yönlendiren, kendi niş/alanına göre kişiselleştirilmiş senaryolar sunan ve kullanıcıyı doğrudan cevap vermek yerine araştırmaya iten bir öğrenme deneyimi sağlar.

Fikir, geliştiricinin kendi İçerik Zekâsı (Instagram içerik analizi) projesiyle bağlantılı gerçek bir ihtiyaçtan türetilmiştir: içerik üreticilerinin sık karşılaştığı stratejik kararları (veriye dayalı mı trend'e mi güveneceğim, mahremiyetimi mi gelir mi koruyacağım) güvenli bir ortamda deneyip sonuçlarını görmesi.

## 🖥️ Ekranlar

1. **Onboarding** — kullanıcı içerik ürettiği alanı (Moda / Yemek / Fitness / Kişisel Marka) seçer; bundan sonraki tüm senaryolar bu bilgiye göre kişiselleştirilir.
2. **Ana Panel** — ilerleme çubuğu, kazanılan rozetler ve 4 senaryonun listesi (tamamlanan/tamamlanmayan durumu).
3. **Senaryo** — niş'e özel bir durum anlatılır, 3 seçenek sunulur; seçim yapınca "neden bunu seçtin?" diye kısa bir yansıma yazması istenir (cevap dayatılmaz).
4. **Sonuç** — seçimin gerçekçi sonucu + kazanılan rozet + "araştır" ipucu (doğru/yanlış değil, araştırılacak bir terim/soru) gösterilir.

## 🧠 Kişiselleştirme ve "yargılamadan yönlendirme" nasıl sağlandı?

- Senaryo metinleri seçilen niş'e göre değişir (`situation(niche)`).
- Her seçimden sonra "doğru/yanlış" etiketi yok — gerçekçi bir sonuç + bir araştırma sorusu var.
- Rozetler tamamlama için verilir, "doğru seçim" için değil.
- Kullanıcının kendi yansıma metni kaydedilir (localStorage), ona cevabı düşündürme zorunluluğu var (metin boşsa "Sonucu Gör" butonu kilitli).

## 🚀 Nasıl Çalıştırılır?

Gereksinim: [Node.js](https://nodejs.org/) (v18+)

```bash
cd icerik-kocu
npm install
npm start
```

Tarayıcıda (veya telefonun tarayıcısında, aynı ağdaysan bilgisayarın IP'si ile) aç:

```
http://localhost:5173
```

## ✅ Testler (Cypress)

Uygulama ayaktayken (`npm start`), başka bir terminalde:

```bash
npm run cy:run      # headless çalıştırır
npm run cy:open     # test arayüzünü açar
```

Testler (`cypress/e2e/app.cy.js`) şunları doğrular:
- Onboarding → niş seçimi → ana panele geçiş
- Bir senaryoyu tamamlama → rozet kazanma → ilerlemenin güncellenmesi
- Tamamlanmış bir senaryoya tekrar girince seçeneklerin değil, sonucun gösterilmesi
- "Baştan başla" ile sıfırlama

## 📁 Proje Yapısı

```
icerik-kocu/
├── index.html          ← 4 ekran (tek sayfa, show/hide)
├── style.css           ← mobil görünüm (telefon çerçevesi)
├── app.js              ← senaryo verisi + uygulama mantığı
├── server.js           ← bağımlılıksız statik sunucu (Node http)
├── cypress.config.js
└── cypress/e2e/app.cy.js
```

## 🧪 Gerçek Kullanıcı Testi

Bkz. [`kullanici-testi-raporu.md`](./kullanici-testi-raporu.md) — gerçek bir kişiye uygulama test ettirilip bulgular bu dosyaya işlenecektir.

## 🎬 Tanıtım Videosu

Bkz. [`video-script.md`](./video-script.md) — ekran kaydı değil, anlatımlı tanıtım videosu için konuşma taslağı.

## 👩‍💻 Öğrenci Bilgileri

- **Ad Soyad:** Melike Tıkır
- **Öğrenci No:** 231118022
- **E-posta:** meliketikir012@gmail.com
- **GitHub:** <!-- repo linkini buraya ekle -->

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
