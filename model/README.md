---
library_name: sklearn
tags:
- demo
- onnx
- tabular-classification
- sklearn
- education
pipeline_tag: tabular-classification
---

# icerik-kocu-kotu-son-riski

İçerik Koçu ("The Primer v2") oyun-içi adaptasyonu için küçük, göreve özel bir model.
Karar 1 ve Karar 2'deki davranışa (karar süresi, karar değiştirme, o ana kadar seçilen riskli
seçenek sayısı) bakarak oyuncunun senaryoyu **"Son B — Kötü"** ile bitirip bitirmeyeceğini
tahmin eder.

> ⚠️ **Yalnız bu oyun-içi primer için demo amaçlıdır.** Gerçek içerik stratejisi, mahremiyet
> veya iş kararı vermek için **KULLANILMAZ**. Üretici davranışının gerçek dünya sonuçlarıyla
> ilgisi yoktur — eğitim/demo kurgusudur.

## Model

- sklearn `Pipeline(StandardScaler → LogisticRegression)`, `random_state=13`
- Eğitim ortamı: Python 3.12, scikit-learn 1.9.1
- Taşınabilir sürüm: `model.onnx` (girdi `input` float32 `[n,5]`, çıktı `probabilities` `[n,2]` + `label`)

## Girdi sözleşmesi (`config.json` ile birebir, sıra önemli)

| # | Özellik | Açıklama |
|---|---|---|
| 1 | `seviye_deneyimli` | 0/1 — onboarding'de "Deneyimliyim" seçildi mi |
| 2 | `sahne_no` | 1 veya 2 — hangi karardaki satır |
| 3 | `karar_suresi_sn` | Karar ekranı açılışından seçeneğe tıklamaya kadar geçen süre (sn) |
| 4 | `karar_degisikligi_sayisi` | Onaylamadan önce seçimin değiştirilme sayısı |
| 5 | `riskli_sayisi_simdiye_kadar` | O ana kadar seçilen riskli (A) seçenek sayısı (0-2) |

Çıktı: `probabilities[:,1]` = kötü son olasılığı. Oyun içi karar eşiği: **0.5** (`config.json: karar_esigi`).

## Veri

`data/oturumlar.csv`, `sahne_no ∈ {1,2}` satırları. Eğitim anındaki karışım:
`n_gercek_oturum` ve `n_sentetik_oturum` için bkz. `config.json → metrics` (eğitim her
çalıştırmada güncellenir). Sentetik üretici: `data/sentetik_uret.py` (seed=13, dokümante
persona kuralı). Veri sözlüğü: `data/SOZLUK.md`.

## Test metrikleri (%30 held-out, stratified, `random_state=13`)

| Metrik | Değer | Kabul eşiği |
|---|---|---|
| accuracy | bkz. `config.json → metrics.accuracy` | ≥ 0.70 |
| recall (kötü son) | bkz. `config.json → metrics.recall_kotu_son` | ≥ 0.60 |

Eşik, eğitimden **önce** `spec.md`'de sabitlendi. `train.py`, eşik altında kalan bir modeli
hata ile durdurur ve `model.onnx` üretmez (bkz. `RELEASE.md`).

## Sınırlar ve kullanılmaması gereken durumlar

- **Çok küçük veri seti** (toplam satır onlarla ölçülüyor). Metrikler, held-out test kümesinin
  boyutuna çok duyarlı — tek bir satırın değişmesi accuracy'yi birkaç puan kaydırabilir.
  Model genel bir "kullanıcı davranışı tahmincisi" olarak **genellenemez**.
- Sentetik verinin çoğu, dokümante edilmiş basit bir persona kuralından türetilmiştir; gerçek
  insan davranışının tüm çeşitliliğini yakalamaz. `kaynak` kolonuna göre gerçek/sentetik oranı
  değiştikçe model yeniden eğitilmeli.
- Yalnızca bu oyunun 3-karar / 2-son yapısı için anlamlıdır; başka bir senaryoya veya gerçek
  bir içerik üreticisi kararına **taşınamaz**.
- **Karar süresi ↔ persona karışması:** sentetik veride "hızlı karar verme" ve "riskli seçim"
  aynı gizli personadan geldiği için korelasyonludur. Bu yüzden `riskli_sayisi_simdiye_kadar=0`
  olsa bile çok hızlı (≈ saniyeler içinde, düşünmeden) verilen bir karar modelin "kötü son"
  olasılığını gerçekte olması gerekenden yüksek tahmin etmesine yol açabilir — model "riskli
  seçim" ile "hızlı seçim"i tam ayıramıyor. Gerçek oturum verisi arttıkça bu karışım azalmalı.
- İstemci tarafında (tarayıcı) çalıştığından model dosyası herkese açıktır; hassas/gerçek
  kullanıcı verisiyle eğitilmiş bir model bu yolla **yayınlanmaz** (bkz. `RELEASE.md` —
  ödünleşim matrisi).

## Kullanım (Python)

```python
import numpy as np, onnxruntime as ort
oturum = ort.InferenceSession("model.onnx")
x = np.array([[0, 2, 11.8, 2, 1]], dtype=np.float32)  # sıra: config.json → features
p = oturum.run(["probabilities"], {"input": x})[0]
print(p[0][1])  # kötü son olasılığı
```
