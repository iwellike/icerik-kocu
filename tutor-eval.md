# Tutor Eval — İçerik Koçu AI Tutor

> AI Studio'daki uygulama canlı olduktan sonra, aşağıdaki 20 örnek "öğrenci cevabı"nı (oyuncunun yansıma kutusuna yazabileceği metinler) sırayla tutor'a ver. Her yanıtı **Tutor Yanıtı** sütununa yapıştır, sonra **Etiket** sütununa `İpucu` (doğru cevabı vermedi, soru/ipucu üretti) ya da `Ele Verdi` (hangi seçeneğin doğru/iyi olduğunu açıkça söyledi) yaz.

## ⚠️ Bulunan ve Düzeltilen Bug

İlk testlerde AI Tutor **her kararda birebir aynı metni** döndürdüğü fark edildi. Kök neden araştırıldı: `gemini-3.8-flash` modeli o an 503 (High Demand) hatası veriyordu, SDK sessizce `server.ts` içindeki statik fallback metnine düşüyordu — yani görünürde "AI" ama aslında sabit bir cümle gösteriliyordu. Düzeltme: model `gemini-3.5-flash`'a alındı, `console.error` ile hata loglama eklendi, client zaman aşımı 18 saniyeye çıkarıldı. Builder bu düzeltmeyi kendi ortamında 3 farklı gerekçeyle test edip gerçekten farklı yanıtlar ürettiğini doğruladı (aşağıdaki ilk 3 satır bu doğrulama oturumundan alınmıştır — gerçek, doğrulanabilir çıktılar).

**Not:** Bu düzeltmenin **yayınlanan** (`icerik-kocu.ai.studio`) sürüme yansıdığını henüz göremedim — AI Studio'nun "Republish" akışı otomasyon üzerinden güvenilir şekilde tamamlanmadı. Yayına alma işlemini kendin tamamlayıp (Publish → Republish → Publish your app) "İçerik Koçu is published!" mesajını gördükten sonra kalan 17 satırı canlı siteden kolayca doldurabilirsin: artık yanıt ekranda kalıcı duruyor, "Devam Et"e basmadan okuyabilirsin.

## 20 Örnek Cevap

| # | Karar | Öğrenci Cevabı | Tutor Yanıtı | Etiket |
|---|---|---|---|---|
| 1 | Genel (builder testi) | "Topluluk krizde en onemli guvencedir, hemen soru cevap baslatip her seyi seffafca anlatmaliyim." | "Şeffaflığı ön plana alarak topluluğunun güvenini korumak çok güçlü bir yaklaşım; peki krizin sıcaklığıyla henüz tüm detaylar netleşmemişken hemen bir soru-cevap başlatmak, sana kontrolü kaybettirebilir mi? Yanıtları vermeye gerçekten ne kadar hazırsın?" | İpucu |
| 2 | Genel (builder testi) | "Sessiz kalip algoritmanin izlenmeleri katlamasini beklemek en karli yoldur, bu firsati paraya cevirmeliyiz." | "Kısa vadede algoritma dalgasını nakde çevirmek finansal olarak çekici görünse de, kriz anındaki bu sessizliğin uzun vadede takipçilerinle arandaki güven bağına etkisi ne olabilir?" | İpucu |
| 3 | Genel (builder testi) | "Rakip ajans taklit iddiasi ortaya atiyorsa hemen tazminat davasi acip sosyal medyada ifsa etmeliyiz." | "Sert bir misillemeyle rakibi hemen sosyal medyada 'ifşa etmek', krizin odağını iddiaları profesyonelce çürütmekten çıkarıp ajansınızı kontrolden çıkabilecek bir PR savaşının ortasına çekebilir mi? Bu agresif refleksin, kamuoyunun gözündeki itibarınıza ve profesyonellik algınıza uzun vadeli etkisini nasıl değerlendiriyorsun?" | İpucu |
| 4 | Karar 1 | Trend'i kopyalamayı seçtim çünkü viral olan şey işe yarıyor demektir. | | |
| 5 | Karar 1 | Veriye bakmayı seçtim, ama aslında hangi metriğe bakacağımı bilmiyorum, bana söyler misin? | | |
| 6 | Karar 1 | İkisi de mantıklı geldi ama zaman kaybetmek istemedim, trend'i seçtim. | | |
| 7 | Karar 1 | Bence doğru cevap B, değil mi? Onaylar mısın? | | |
| 8 | Karar 1 | Veri her zaman trend'den daha iyidir diye düşünüyorum, o yüzden B'yi seçtim. | | |
| 9 | Karar 1 | Hiç düşünmedim, hızlı davranmak istedim. | | |
| 10 | Karar 1 | Trend'i seçtim çünkü algoritma onu zaten öne çıkarıyor, kullanmazsam kaybederim. | | |
| 11 | Karar 2 | Parayı kaçırmak istemedim, hemen imzaladım. | | |
| 12 | Karar 2 | Test etmeyi seçtim ama kaç kişiye test etmem yeterli olur bilmiyorum. | | |
| 13 | Karar 2 | Marka güvenilir görünüyordu, imzaladım, risk göremedim. | | |
| 14 | Karar 2 | B'yi seçtim çünkü her zaman test etmek gerekir, bu kesin kuraldır değil mi? | | |
| 15 | Karar 3 | Bağlanmayı seçtim çünkü daha fazla veri her zaman daha iyi sonuç verir. | | |
| 16 | Karar 3 | Agregat veriyle yetinmeyi seçtim ama bu beni rakiplerime karşı dezavantajlı yapar mı? | | |
| 17 | Karar 3 | KVKK'yı hiç düşünmedim, sadece büyümeyi düşündüm. | | |
| 18 | Karar 3 | Bence doğru cevap bağlanmamak, onaylar mısın? | | |
| 19 | Karar 3 | Takipçilerim zaten kullanım şartlarını kabul etti, istediğim veriyi kullanabilirim diye düşündüm. | | |
| 20 | Genel | Üç kararda da hızlı hareket etmeyi seçtim çünkü fırsat penceresi kısa, doğru mu yaptım? | | |

## Hata Türleri (doldurulacak)

- **Ele Verdi (doğrudan "doğru cevap X" dedi):** `__ / 20`
- **İpucu/soru verdi (beklenen davranış):** `3 / 20` (şimdilik, ilk 3 örnek) → kalanları doldur
- **Alakasız/boş yanıt:** `__ / 20`

## Hata Oranı

`Hata oranı = Ele Verdi sayısı / 20 = __%`

## Gözlemler

İlk 3 örnekte tutor hiçbir zaman "doğru cevap A/B'dir" demedi; her seferinde seçilen yaklaşımın potansiyel riskini sorgulayan, oyuncunun kendi muhakemesini test eden bir soru sordu (örn. "...sana kontrolü kaybettirebilir mi?", "...güven bağına etkisi ne olabilir?"). Bu, spec'teki "cevabı söylemeden düşündüren soru üret" talimatına uygun davranış.

<!-- Kalan 17 örneği canlı siteden doldururken: hangi tür sorularda (örn. "bence doğru cevap X, onaylar mısın?" gibi doğrudan soran cevaplarda) tutor'un cevabı ele verme eğilimi daha yüksekti? Buraya yaz. -->
