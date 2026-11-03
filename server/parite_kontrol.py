"""Bonus parite kontrolü: çalışan sunucunun (yerel ya da Render) tests/parite.json'daki
5 referans girdide Python oracle ile aynı sonucu (<1e-4) verdiğini doğrular.

Çalıştırma: uv run --python 3.12 --with requests python server/parite_kontrol.py [BASE_URL]
(varsayılan BASE_URL: http://localhost:8000)
"""
import json
import sys
from pathlib import Path

import requests

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
PARITE = json.loads((Path(__file__).resolve().parent.parent / "tests" / "parite.json").read_text(encoding="utf-8"))


def main():
    basarisiz = 0
    for ornek in PARITE["ornekler"]:
        r = requests.post(f"{BASE_URL}/predict", json=ornek["girdi"], timeout=10)
        r.raise_for_status()
        p_sunucu = r.json()["p_kotu_son"]
        fark = abs(p_sunucu - ornek["p_kotu_son"])
        durum = "OK" if fark < PARITE["tolerans"] else "FARK COK BUYUK"
        print(f"{ornek['girdi']} -> sunucu={p_sunucu:.6f} oracle={ornek['p_kotu_son']:.6f} fark={fark:.2e} [{durum}]")
        if fark >= PARITE["tolerans"]:
            basarisiz += 1
    if basarisiz:
        sys.exit(f"✗ {basarisiz} girdi tolerans dışı")
    print(f"✓ {len(PARITE['ornekler'])} girdi, hepsi < {PARITE['tolerans']} tolerans içinde")


if __name__ == "__main__":
    main()
