# server/ — Bonus: kendi sunucunuz (FastAPI)

Aynı `model/model.onnx`'i çalıştıran, bağımsız bir tüketici. Model istemciye inmez (bkz.
`RELEASE.md` → ödünleşim matrisi, sütun 3: "Model gizli kalır mı? **Evet**").

## Yerel çalıştırma

```bash
uv run --python 3.12 --with-requirements server/requirements.txt uvicorn server.main:app --port 8000
```

```bash
curl -s -X POST localhost:8000/predict -H 'Content-Type: application/json' \
  -d '{"seviye_deneyimli":0,"sahne_no":1,"karar_suresi_sn":3.0,"karar_degisikligi_sayisi":0,"riskli_sayisi_simdiye_kadar":0}'
```

## Parite kontrolü (bonus kabul kriteri)

```bash
uv run --python 3.12 --with requests python server/parite_kontrol.py
# Render'a deploy ettikten sonra:
uv run --python 3.12 --with requests python server/parite_kontrol.py https://<render-servisiniz>.onrender.com
```

`tests/parite.json`'daki 5 referans girdide Python oracle (`tests/parite.py`) ile `<1e-4`
toleransla aynı sonucu verdiğini doğrular.

## Render.com'a deploy (ücretsiz katman)

1. Bu repo GitHub'a push edilmiş olmalı.
2. [render.com](https://render.com) → New → Blueprint → bu repoyu seç (`render.yaml` otomatik
   algılanır: `buildCommand: pip install -r server/requirements.txt`,
   `startCommand: uvicorn server.main:app --host 0.0.0.0 --port $PORT`).
3. Deploy sonrası verilen URL ile `server/parite_kontrol.py <url>` çalıştırılıp doğrulanır.

> Not: Render ücretsiz katmanda servis birkaç dakika boşta kalınca uyur; ilk istek
> onlarca saniye sürebilir (bkz. `RELEASE.md` → ödünleşim matrisi, "gecikme" satırı).
