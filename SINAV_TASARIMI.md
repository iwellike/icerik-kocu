# SINAV_TASARIMI.md — "Sizinle Uyumlanan Sınav Tasarımı"

## Soru

> Bu sınavı siz olsanız nasıl tasarlardınız? Kapalı kitap, ezberi değil kavramların gerçek özünü ve gerekçesini ölçen 1 sayfalık klasik bir vize sorusu nasıl olurdu?

## Senaryo (kendi özgün sorum)

> İçerik Koçu v2'de `train.py` şunu yapıyor: aynı veriyle art arda iki kez çalıştırıldığında,
> **farklı** `accuracy` değerleri üretiyor (örn. birinde 0.78, birinde 0.61). İkinci çalıştırmada
> eval kapısı `0.70` eşiğinin altında kalıp betiği durduruyor. Takım arkadaşın "model şansa bağlı,
> `random_state`'i kaldırıp birkaç kez deneyelim, hangisi geçerse onu yayınlayalım" diyor.
>
> **(a)** Bu önerinin neden yanlış olduğunu, dersteki **doğrulama vs. geçerleme (verification vs.
> validation)** ayrımını kullanarak açıkla. Hangisi ihlal ediliyor?
>
> **(b)** `train_test_split`'e sabit bir `random_state` koymak, çalıştırma-dan-çalıştırmaya
> farklı sonucu engeller mi? Neden/neden değil? (İpucu: veri setinin boyutuyla ilişkisini
> düşün — 28 satırlık bir test kümesinde tek bir satırın değişmesi accuracy'yi nasıl etkiler?)
>
> **(c)** Takım arkadaşının önerisini kabul edip "en iyi skoru veren tohumu" seçseydiniz,
> bu ölçtüğünüz şey artık nedir — modelin gerçek performansı mı, yoksa rastgele arama
> sürecinin bir yan ürünü mü? Bu durumu tanımlayan terimi yazın.
>
> **(d)** Aynı `model.onnx` dosyasını hem Python (`tests/parite.py`) hem tarayıcıda
> (`onnxruntime-web`) aynı 5 referans girdiyle çalıştırıp olasılıkları `1e-4` toleransla
> karşılaştırmak hangi test türüdür? Bu testin **doğrulamayı** değil **neyi** kanıtladığını
> bir cümlede yazın.

## Beklenen temel kavramlar

- **Doğrulama (verification):** "Sistemi doğru mu inşa ettik?" — spesifikasyona uyum (örn.
  eval kapısının eşik altında betiği durdurması, kontratın `config.json` ile tutarlılığı).
- **Geçerleme (validation):** "Doğru sistemi mi inşa ettik?" — modelin gerçek dünyada/gerçek
  kullanıcı davranışında işe yarayıp yaramadığı. Tohum değiştirip en iyi skoru seçmek,
  **geçerlemeyi** (gerçek performansı) değil, rastgele aramanın bir yan ürününü ölçer.
- **Overfitting to the test set / "p-hacking" benzeri seçim yanlılığı:** çok küçük (≈28-40
  satır) bir test kümesinde tohum değiştirmek, "iyi" skor bulana kadar aramaktır; bu skor
  artık modelin gerçek genelleme performansını temsil etmez.
- **Küçük veri + varyans ilişkisi:** test kümesi küçükse tek bir satırın sınıfı değişince
  accuracy büyük sıçrama yapar (28 satırda 1 satır ≈ %3.5 puan) — bu yüzden eşik + sabit
  tohum + (ileride) k-fold/çapraz doğrulama birlikte gerekir.
- **Diferansiyel test (parite testi):** iki farklı implementasyonun (Python oracle vs.
  ONNX/tarayıcı) aynı girdide aynı çıktıyı verdiğini kanıtlar — modelin "doğru" olduğunu değil,
  **taşınırken bozulmadığını** (sözleşmeye sadık kaldığını) kanıtlar.

## Çeldiriciler (sınavda yanlış ama cazip cevaplar)

- "`random_state` koymak varyansı tamamen ortadan kaldırır" → yanlış, sadece *tekrarlanabilirlik*
  sağlar (aynı kod + aynı veri + aynı tohum = aynı sonuç); veri veya tohum değişirse skor
  yine değişir.
- "En iyi skoru veren tohumu seçmek meşru bir hyperparameter arama yöntemidir" → yanlış,
  çünkü tohum bir hyperparameter değil, test kümesinin *hangi satırların* test'e düştüğünü
  belirleyen rastgele bir değişken; onu "optimize etmek" test setine sızıntıdır (leakage).
- "Parite testi geçtiyse model doğrudur" → yanlış, parite testi yalnız **taşıma/sözleşme**
  doğruluğunu (verification) kanıtlar, modelin gerçek dünyadaki yararlılığını (validation) değil.
