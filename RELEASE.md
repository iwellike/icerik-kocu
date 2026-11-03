# RELEASE.md — İçerik Koçu v2.0 (kötü-son-riski modeli)

## v2.0'da ne değişti

- v1'deki sabit kural ("Yeni başlıyorum" → her zaman ipucu, "Deneyimliyim" → her zaman 60s süre
  baskısı) yanına, Karar 1-2'deki davranıştan öğrenen küçük bir model eklendi
  (`icerik-kocu-kotu-son-riski`, bkz. `spec.md` → "v2 — Kötü Sona Gitme Riski Modeli").
- Model eşiği (≥0.5) geçerse Karar 3'te: ipucu kutusu seviyeden bağımsız zorla açılır, süre
  sayacı kaldırılır. Eşik altında v1 davranışı aynen sürer (geriye dönük uyumlu — model
  hiç yüklenemezse de `modelRiskTahminiVarsayilan` fallback'i v1 davranışına düşer, bkz. `app.js`).
- Yeni dosyalar: `train.py`, `model/`, `data/SOZLUK.md`, `data/sentetik_uret.py`,
  `tests/parite.py`, `tests/parite.json`, `cypress/e2e/model.cy.js`.

## Sürüm sabitleme (Hugging Face)

Tüketiciler modeli `main` dalından değil, **commit'e sabitlenmiş** resolve URL'den çeker:

```
https://huggingface.co/<HF_KULLANICI>/icerik-kocu-kotu-son-riski/resolve/<COMMIT_SHA>/model.onnx
https://huggingface.co/<HF_KULLANICI>/icerik-kocu-kotu-son-riski/resolve/<COMMIT_SHA>/config.json
```

> `<HF_KULLANICI>` / `<COMMIT_SHA>`: Hugging Face'e yayınlandıktan sonra buraya ve
> `app.js`'teki `MODEL_URL` sabitine yazılır (bkz. Task 5 / aşağıdaki "Yayın günlüğü").

## Rollback

Sorun çıkarsa (ör. yeni model yanlış/zararlı müdahale tetikliyor):

1. `app.js` içindeki `MODEL_URL` sabitini bir önceki çalışan commit'in resolve URL'sine
   geri al (tek satır değişiklik, git revert ile iz bırakır).
2. Acil durumda `MODEL_ESIK`'i `1.01` yaparak override'ı fiilen devre dışı bırakmak da
   mümkündür — bu, model dosyasını değiştirmeden anında v1 davranışına döner (kill-switch).
3. Hugging Face tarafında eski model dosyası **silinmez**; her commit kalıcı olduğundan
   geri dönüş yalnızca hangi commit'e işaret edildiğini değiştirmektir.

## Güvenli devreye alma

Bu proje tek-kullanıcılık bir demo (AI Studio / yerel prototip) olduğundan gerçek trafik
bölümleme altyapısı (load balancer, feature flag servisi) yok. Senaryo, bu projenin
ölçeğine uyarlanmış haliyle:

- **Shadow Deployment:** Yeni modeli gerçek oturumlarda (gerçek 15 oturum toplanırken)
  **sessizce** çalıştırıp `kotuSonRiski` değerini `state.log`'a kaydet, ama Karar 3
  davranışını henüz DEĞİŞTİRME (yani `override` her zaman `null` dönecek şekilde model
  çağrısı yorum satırına alınır). Elde edilen olasılıkları gerçek nihai sonuçla (`kotu_son`)
  karşılaştırarak modelin gerçek dünyada da `recall`/`accuracy` eşiğini tuttuğunu doğrula.
  Bu projede bu adım, `train.py`'nin test-setindeki ölçümüyle (held-out, aynı dağılımdan)
  karşılık bulur; gerçek 15 oturum toplandıktan sonra `train.py` yeniden çalıştırılıp
  metrikler tekrar kontrol edilmeden override canlıya alınmamalı.
- **Canary (%5):** Tek kullanıcılı bir oyun olduğundan "trafiğin %5'i" yerine
  **oturumların %5'i** anlamına gelir: `Math.random() < 0.05` ile seçilen oturumlarda
  override aktif, geri kalanında v1 davranışı — birkaç gün/oturum boyunca anormal davranış
  (ör. her zaman "kötü son" tahmini) gözlemlenmezse bir sonraki adıma geçilir.
- **Progressive Rollout (%25 → %50 → %100):** Canary eşiği kademeli yükseltilir
  (`Math.random() < 0.25`, sonra `0.50`, sonra override her zaman aktif / mevcut kod).
  Mevcut repodaki hal **%100** (son aşama) — demo/ödev amaçlı doğrudan tam aktif,
  ama yukarıdaki kademeleme gerçek bir üretim ortamında izlenecek yoldur.

## Mimari dağıtım kararı ve ödünleşim matrisi

| Soru | Tarayıcı (`onnxruntime-web`) — **seçilen** | Cihaz İçi Mobil (`Expo` + gömülü ONNX) | Kendi Sunucunuz (`FastAPI`/`Rails` + `onnxruntime`) |
|---|---|---|---|
| **1. İnternet zorunlu mu / gecikme nasıl davranır?** | İlk ziyarette model+wasm indirilir (~11 MB, birkaç saniye), sonra tarayıcı önbelleğinden anında çalışır; internetsiz **ilk yükleme başarısız olur**, sonrasında çevrimdışı çalışabilir. | Gömülüyse tamamen çevrimdışı, sıfır ağ gecikmesi; uzak modelse web ile aynı ilk-indirme maliyeti. | Her çağrıda ağ round-trip'i (+sunucu soğuk başlangıcı, Render ücretsiz katmanda uyku modundan uyanma ~onlarca saniye sürebilir). |
| **2. Veri cihazdan çıkar mı?** | **Hayır** — girdi (karar süresi, seçim sayıları) tamamen tarayıcıda işlenir, hiçbir yere gönderilmez (bkz. `model/README.md`). | Gömülüyse hayır; uzak-model modunda da çıkarım yine cihazda (yalnız model dosyası iner). | **Evet** — her tahmin isteği girdiyi sunucuya gönderir; bu demo için hassas veri yok ama genel ilke olarak not edilmeli. |
| **3. Model gizli kalır mı?** | **Hayır** — `model.onnx` herkese açık (HF public repo), istemciye tam iner; isteyen indirip inceleyebilir/tersine mühendislik yapabilir. | Aynı şekilde hayır (dosya cihaza iner). | **Evet** — model yalnız sunucuda; istemci yalnız girdi/olasılık görür, modelin kendisini göremez. |

**Karar:** Bu projede model hassas veriyle eğitilmemiş, demo amaçlı küçük bir sınıflandırıcı
olduğundan "model gizli kalsın" kaygısı yok → **tarayıcı** (ücretsiz, sunucusuz, zaten var
olan `web/` benzeri statik yapıya ve mevcut Cypress test altyapısına doğrudan oturuyor)
en lazy-ama-doğru seçenek. Gerçek bir ürün, hassas kullanıcı verisiyle eğitilmiş bir model
kullansaydı üçüncü sütun (kendi sunucunuz) zorunlu olurdu (bkz. `model/README.md` → sınırlar).
Bonus olarak bu repoda `server/` altında kendi-sunucunuz seçeneği de uygulanmıştır
(bkz. aşağıda "Bonus").

## Yayın günlüğü

| Tarih | Commit | Not |
|---|---|---|
| _(doldurulacak)_ | _(doldurulacak)_ | İlk yayın — `train.py` eşiği geçti (accuracy/recall, bkz. `model/config.json`) |

## Bonus — kendi sunucunuz

`server/` (FastAPI, `onnxruntime` Python paketi) aynı `model.onnx`'i çalıştırır ve
`tests/parite.json`'daki referans girdilerde `<1e-4` toleransla aynı sonucu verir
(bkz. `server/README.md`).
