# data/SOZLUK.md — oturumlar.csv veri sözlüğü

Her satır **bir kararı** temsil eder (bir oturumda 3 satır: `sahne_no` 1, 2, 3).

| Kolon | Tip | Birim / Değer aralığı | Açıklama |
|---|---|---|---|
| `oturum_id` | string | 8 hex karakter, rastgele | Oturumu tekil tanımlar. Kişiyle ilişkilendirilemez (ad, e-posta, cihaz kimliği, konum **toplanmaz**). |
| `kaynak` | enum | `gercek` \| `sentetik` | `gercek`: uygulamayı oynayan bir insandan `server.js` üzerinden otomatik loglanan satır. `sentetik`: `data/sentetik_uret.py` ile üretilen satır. |
| `seviye` | enum | `Yeni başlıyorum` \| `Deneyimliyim` | Onboarding'de oyuncunun verdiği cevap. |
| `rol` | enum | `Bireysel içerik üretici` \| `Marka/ajans yöneticisi` | Onboarding cevabı (model girdisi değil, bağlam). |
| `hedef` | enum | `Erişim/takipçi büyütmek` \| `Güven ve itibar kazanmak` | Onboarding cevabı (model girdisi değil, bağlam). |
| `sahne_no` | int | 1, 2, 3 | Kararın sırası (Karar 1=Strateji, 2=Doğrulama, 3=Mahremiyet). |
| `karar_suresi_sn` | float | saniye, ≥ 0 | Karar ekranının açılmasından seçeneğe tıklanmasına kadar geçen süre. "Deneyimliyim" modunda süre 60'ı geçerse (otomatik seçim) 60.0 olarak loglanır. |
| `karar_degisikligi_sayisi` | int | ≥ 0 | Oyuncu onaylamadan önce seçimini kaç kez değiştirdi (A→B→A gibi her tıklama +1, ilk tıklama sayılmaz). |
| `riskli_sayisi_simdiye_kadar` | int | 0–3 | Bu karar dahil, oturumda şu ana kadar seçilen riskli (A) seçenek sayısı. |
| `kotu_son` | int | 0 \| 1 | Oturumun nihai sonucu: 1 = Son B (Kötü), 0 = Son A (İyi). Oturumdaki 3 satırda da aynı değer (nihai sonuç). |

## Model girdisi olarak kullanılan kolonlar

`train.py` yalnızca `sahne_no ∈ {1, 2}` satırlarını kullanır (Karar 3 bittiğinde artık müdahale imkânı kalmıyor, bu yüzden Karar 3 satırları eğitime girmez — yalnızca tam log için tutulur).

Girdi özellik sırası (`config.json` ile sözleşme): `seviye`, `sahne_no`, `karar_suresi_sn`, `karar_degisikligi_sayisi`, `riskli_sayisi_simdiye_kadar`. Hedef: `kotu_son`.

## KVKK notu

`oturum_id` `secrets.token_hex(4)` ile rastgele üretilir, hiçbir kimlik/cihaz/konum bilgisiyle eşlenmez. Oturumlar birbirinden bağımsızdır; aynı kişi birden fazla oturum oynasa da bu bağ veri setinde tutulmaz.
