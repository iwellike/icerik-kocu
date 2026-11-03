"""İçerik Koçu v2 — "kötü sona gitme riski" modeli: eğitim + eval kapısı + ONNX export.

Kabul eşiği spec.md'de eğitimden ÖNCE sabitlendi: held-out testte
accuracy >= 0.70 VE "kötü son" sınıfı için recall >= 0.60. Eşik altındaysa betik
hata ile durur, model.onnx/config.json üretilmez (yayınlanmaz).

Çalıştırma (tek komut):
    uv run --python 3.12 --with-requirements requirements.txt python train.py
"""
import json
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

import numpy as np
import pandas as pd
import sklearn
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

BURASI = Path(__file__).resolve().parent
VERI = BURASI / "data" / "oturumlar.csv"
MODEL_DIR = BURASI / "model"

SEED = 13
FEATURES = [
    "seviye_deneyimli", "sahne_no", "karar_suresi_sn",
    "karar_degisikligi_sayisi", "riskli_sayisi_simdiye_kadar",
]
HEDEF = "kotu_son"
ESIK_ACCURACY = 0.70
ESIK_RECALL = 0.60


def veri_yukle():
    df = pd.read_csv(VERI)
    # Karar 3 bittiğinde artık müdahale imkânı yok; model yalnız Karar 1-2 (sahne_no<=2)
    # satırlarıyla eğitilir (bkz. data/SOZLUK.md).
    df = df[df["sahne_no"].isin([1, 2])].copy()
    df["seviye_deneyimli"] = (df["seviye"] == "Deneyimliyim").astype(int)
    return df


def main():
    df = veri_yukle()
    X, y = df[FEATURES], df[HEDEF]
    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.3, stratify=y, random_state=SEED
    )

    model = Pipeline([("scaler", StandardScaler()), ("lr", LogisticRegression(random_state=SEED))])
    model.fit(X_tr, y_tr)
    y_pred = model.predict(X_te)

    metrikler = {
        "accuracy": round(accuracy_score(y_te, y_pred), 4),
        "recall_kotu_son": round(recall_score(y_te, y_pred, pos_label=1, zero_division=0), 4),
        "n_train": int(len(X_tr)),
        "n_test": int(len(X_te)),
        "n_gercek_oturum": int(df.loc[df["kaynak"] == "gercek", "oturum_id"].nunique()),
        "n_sentetik_oturum": int(df.loc[df["kaynak"] == "sentetik", "oturum_id"].nunique()),
    }
    print(f"metrikler: {metrikler}")

    if metrikler["accuracy"] < ESIK_ACCURACY or metrikler["recall_kotu_son"] < ESIK_RECALL:
        sys.exit(
            f"✗ eşik altı (accuracy>={ESIK_ACCURACY} ve recall>={ESIK_RECALL} gerekli) "
            "— model.onnx yayınlanmadı."
        )

    MODEL_DIR.mkdir(exist_ok=True)
    onnx_aktar(model, X_te)

    ornek = X_te.iloc[0]
    config = {
        "title": "icerik-kocu-kotu-son-riski",
        "description": (
            "İçerik Koçu (The Primer v2) için küçük bir model: Karar 1 ve Karar 2'deki "
            "davranıştan (karar süresi, karar değiştirme, riskli seçim sayısı) oyuncunun "
            "senaryoyu 'Son B (Kötü)' ile bitirip bitirmeyeceğini tahmin eder. Yalnız bu "
            "oyun-içi primer için demo amaçlıdır; gerçek içerik/stratejik karar için KULLANILMAZ."
        ),
        "target": HEDEF,
        "class_labels": {"0": "iyi son", "1": "kötü son"},
        "features": [{"name": c, "label": c, "example": float(ornek[c])} for c in FEATURES],
        "classes": [int(c) for c in model.classes_],
        "metrics": metrikler,
        "esikler": {"accuracy": ESIK_ACCURACY, "recall_kotu_son": ESIK_RECALL},
        "karar_esigi": 0.5,
        "seed": SEED,
        "sklearn_version": sklearn.__version__,
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}",
    }
    (MODEL_DIR / "config.json").write_text(
        json.dumps(config, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"✓ model eğitildi ve kapıdan geçti → {MODEL_DIR}")


def onnx_aktar(model, X_ornek):
    """model.onnx: girdi 'input' float32 [n, len(FEATURES)] (sıra=FEATURES), çıktı 'probabilities'."""
    import onnxruntime as ort
    from skl2onnx import to_onnx
    from skl2onnx.common.data_types import FloatTensorType

    onx = to_onnx(
        model,
        initial_types=[("input", FloatTensorType([None, len(FEATURES)]))],
        options={id(model): {"zipmap": False}},
        target_opset=17,
    )
    yol = MODEL_DIR / "model.onnx"
    yol.write_bytes(onx.SerializeToString())

    oturum = ort.InferenceSession(str(yol))
    p_onnx = oturum.run(["probabilities"], {"input": X_ornek.to_numpy(np.float32)})[0]
    fark = float(np.abs(p_onnx - model.predict_proba(X_ornek)).max())
    if fark > 1e-4:
        sys.exit(f"✗ ONNX çıktısı sklearn'den sapıyor (maks fark {fark:.2e})")
    print(f"✓ model.onnx üretildi (sklearn ile maks fark {fark:.1e})")


if __name__ == "__main__":
    main()
