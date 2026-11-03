"""Bonus: kendi sunucunuz — aynı model.onnx'i çalıştıran FastAPI tüketicisi.

Sözleşme model/config.json ile birebir aynıdır (bkz. data/SOZLUK.md). Model istemciye
inmez (gizli kalır) — istemci yalnız girdi/olasılık görür (bkz. RELEASE.md → ödünleşim matrisi).

Çalıştırma: uv run --python 3.12 --with fastapi --with "uvicorn[standard]" --with onnxruntime \
    uvicorn server.main:app --host 0.0.0.0 --port 8000
"""
from pathlib import Path

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI
from pydantic import BaseModel

MODEL_PATH = Path(__file__).resolve().parent.parent / "model" / "model.onnx"
FEATURES = [
    "seviye_deneyimli", "sahne_no", "karar_suresi_sn",
    "karar_degisikligi_sayisi", "riskli_sayisi_simdiye_kadar",
]

app = FastAPI(title="icerik-kocu-kotu-son-riski (bonus server)")
_oturum = ort.InferenceSession(str(MODEL_PATH))


class Girdi(BaseModel):
    seviye_deneyimli: int
    sahne_no: int
    karar_suresi_sn: float
    karar_degisikligi_sayisi: int
    riskli_sayisi_simdiye_kadar: int


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/predict")
def predict(girdi: Girdi):
    x = np.array([[getattr(girdi, f) for f in FEATURES]], dtype=np.float32)
    p = _oturum.run(["probabilities"], {"input": x})[0]
    return {"p_kotu_son": float(p[0][1])}
