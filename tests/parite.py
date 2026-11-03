"""Test Kahini / Oracle — Python + onnxruntime ile 5 referans girdinin olasılığını üretir.

Diferansiyel testin (parite testi) referans tarafı budur: aynı model.onnx'i çalıştıran
başka bir tüketici (web/app.js → onnxruntime-web, bonus: server/) bu dosyadaki girdilerle
`tests/parite.json`'daki olasılıkları 1e-4 toleransla üretmeli (bkz. Cypress diferansiyel testi).

Çalıştırma: uv run --python 3.12 python tests/parite.py
"""
import json
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

BURASI = Path(__file__).resolve().parent
MODEL_YOLU = BURASI.parent / "model" / "model.onnx"
CIKTI = BURASI / "parite.json"
TOLERANS = 1e-4

# Girdi sırası: seviye_deneyimli, sahne_no, karar_suresi_sn, karar_degisikligi_sayisi,
# riskli_sayisi_simdiye_kadar (config.json → features ile aynı sıra).
ORNEKLER = [
    {"seviye_deneyimli": 0, "sahne_no": 1, "karar_suresi_sn": 3.0, "karar_degisikligi_sayisi": 0, "riskli_sayisi_simdiye_kadar": 0},
    {"seviye_deneyimli": 0, "sahne_no": 2, "karar_suresi_sn": 25.0, "karar_degisikligi_sayisi": 3, "riskli_sayisi_simdiye_kadar": 1},
    {"seviye_deneyimli": 1, "sahne_no": 2, "karar_suresi_sn": 4.5, "karar_degisikligi_sayisi": 0, "riskli_sayisi_simdiye_kadar": 2},
    {"seviye_deneyimli": 1, "sahne_no": 1, "karar_suresi_sn": 18.0, "karar_degisikligi_sayisi": 1, "riskli_sayisi_simdiye_kadar": 0},
    {"seviye_deneyimli": 0, "sahne_no": 2, "karar_suresi_sn": 6.0, "karar_degisikligi_sayisi": 0, "riskli_sayisi_simdiye_kadar": 1},
]
SIRA = ["seviye_deneyimli", "sahne_no", "karar_suresi_sn", "karar_degisikligi_sayisi", "riskli_sayisi_simdiye_kadar"]


def main():
    oturum = ort.InferenceSession(str(MODEL_YOLU))
    sonuclar = []
    for girdi in ORNEKLER:
        x = np.array([[girdi[f] for f in SIRA]], dtype=np.float32)
        p = oturum.run(["probabilities"], {"input": x})[0]
        sonuclar.append({"girdi": girdi, "p_kotu_son": round(float(p[0][1]), 6)})

    CIKTI.write_text(
        json.dumps({"model": "model/model.onnx", "tolerans": TOLERANS, "ornekler": sonuclar}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    for s in sonuclar:
        print(f"{s['girdi']} -> p_kotu_son={s['p_kotu_son']}")
    print(f"✓ {CIKTI} yazıldı ({len(sonuclar)} referans girdi)")


if __name__ == "__main__":
    main()
