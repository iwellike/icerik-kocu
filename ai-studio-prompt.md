# AI Studio Build Prompt — İçerik Koçu

> [aistudio.google.com](https://aistudio.google.com) → **Build** → Stitch'ten "Build with AI Studio" ile aktarılan 3 ekran (görsel+HTML) otomatik eklenir → aşağıdaki metni prompt kutusuna yapıştır.

```
Ekteki 3 görsel/HTML, Stitch'te tasarladığım üç ekran (Giriş, Sahne/Karar, Son). Bu tasarımlara sadık, tek sayfalık, mobil-öncelikli, GERÇEKTEN ÇALIŞAN bir web uygulaması ("İçerik Koçu") inşa et. Kullanıcı akışı ve mantık:

1) GİRİŞ: 3 soru sor — Seviye (Yeni başlıyorum / Deneyimliyim), Rol (Bireysel içerik üretici / Marka-ajans yöneticisi), Hedef (Erişim/takipçi büyütmek / Güven ve itibar kazanmak). Üçü de seçilmeden "Başla" pasif.

2) TEK SENARYO, 3 SIRALI KARAR: Başlangıç metni: "Gece yarısı bir videon beklenmedik şekilde 1 milyon izlenmeye ulaştı. Sabah hesabını açtığında yüzlerce mesaj ve bir marka işbirliği teklifi seni bekliyor."
   Karar 1 · Strateji: A) Aynı formatı art arda paylaş (riskli) B) Son 24 saatin izleyici verisine bak (veri-odaklı)
   Karar 2 · Doğrulama: A) Marka teklifini hemen imzala (riskli) B) Ürünü önce küçük kitleye test et (veri-odaklı)
   Karar 3 · Mahremiyet: A) Takipçi konum/mesaj verisine erişen 3. parti analitik aracına bağlan (riskli) B) Sadece platformun anonim/agregat istatistikleriyle yetin (veri-odaklı)
   Her veri-odaklı (B) seçim +1 puan. Puan >=2 ise "Son A — İyi" ("Takipçin kalıcı olarak büyüdü, marka ortaklığın uzun soluklu oldu, hiçbir gizlilik şikâyeti almadın."), değilse "Son B — Kötü" ("Viral an geçti, test edilmemiş ürün itibarını zedeledi, bir takipçi konum verisi paylaşımını fark edip seni ifşa etti.").

3) Kişiselleştirme: Seviye="Yeni başlıyorum" seçilirse her karar ekranında kısa bir ipucu kutusu göster (cevabı vermeyen, düşündüren bir ip ucu). Seviye="Deneyimliyim" seçilirse ipucu yerine 60 saniyelik geri sayım göster; süre dolunca otomatik olarak riskli (A) seçenek seçilsin.

4) AI TUTOR (ÇOK ÖNEMLİ): Her karar seçildikten sonra oyuncudan kısa bir yansıma metni iste ("Bunu neden seçtin?"). Yansımayı gönderince GERÇEK bir Gemini API çağrısıyla (statik/kalıp metin DEĞİL) bir yanıt üret. Sistem talimatı: "Sen bir yazılım/içerik strateji koçusun. Oyuncunun yazdığı yansımaya ASLA doğrudan 'doğru seçenek A/B'dir' deme veya hangi seçeneğin daha iyi olduğunu açıkça söyleme. Bunun yerine oyuncuyu düşünmeye iten TEK bir soru veya ipucu üret, kısa (1-2 cümle) ve o kararın bağlamına özel olsun." Yanıtı bir "🎓 AI Tutor" kutusunda göster, altında "Devam Et" butonu.

5) SON: Puanı (X/3) ve son metnini göster, "Baştan Başla" butonu tüm state'i sıfırlasın.

Teknik: Tek sayfa, state React/vanilla JS ile yönetilsin, Gemini API çağrısı için hazır API key entegrasyonunu kullan (AI Studio'nun kendi key yönetimini kullan). Mobilde (telefon tarayıcısında) baştan sona sorunsuz oynanabilir olmalı. Kullanıcı hesabı/giriş sistemi EKLEME — kapsam dışı.
```

## Sonraki adımlar (AI Studio'da)

1. Build bitince **Preview**'dan telefon genişliğinde test et — her 2 sonu da (A ve B) en az bir kez tetikleyip doğrula.
2. AI Tutor kutusunun gerçekten her seferinde farklı/dinamik bir cevap ürettiğini (statik metin olmadığını) kontrol et.
3. **Publish** ile bir `.ai.studio` linki al, bu linki `README.md`'deki "AI Studio Uygulaması" alanına ekle.
4. `tutor-eval.md`'deki 20 örnek yansımayı tek tek tutor'a (veya AI Studio'nun chat/test panelinden) geçirip yanıtları etiketle.
