"""Sentetik oturum verisi üretici (data/SOZLUK.md ile aynı şema).

Kural: her oturuma gizli bir "risk-persona" atanır (risk_egilimi: 0..1).
Persona hem karar süresini/değişiklik sayısını hem de A/B seçimini etkiler,
böylece ilk iki karardaki davranış üçüncü kararla gerçekçi şekilde korelasyonlu olur
(tamamen rastgele etiketleme yerine öğrenilebilir bir sinyal).

Çalıştırma: python data/sentetik_uret.py
Tohum: 13 (sabit, tekrar çalıştırınca birebir aynı satırlar üretilir).
"""
import csv
import random
import secrets
from pathlib import Path

SEED = 13
N_OTURUM = 40  # 40 sentetik oturum x 3 karar = 120 satır

SEVIYELER = ["Yeni başlıyorum", "Deneyimliyim"]
ROLLER = ["Bireysel içerik üretici", "Marka/ajans yöneticisi"]
HEDEFLER = ["Erişim/takipçi büyütmek", "Güven ve itibar kazanmak"]

CSV_PATH = Path(__file__).parent / "oturumlar.csv"
FIELDS = [
    "oturum_id", "kaynak", "seviye", "rol", "hedef", "sahne_no",
    "karar_suresi_sn", "karar_degisikligi_sayisi", "riskli_sayisi_simdiye_kadar",
    "kotu_son",
]


def uret_oturum(rng: random.Random):
    risk_egilimi = rng.random()  # 0 = hep veri-odaklı, 1 = hep riskli
    seviye = rng.choice(SEVIYELER)
    rol = rng.choice(ROLLER)
    hedef = rng.choice(HEDEFLER)

    satirlar = []
    riskli_sayac = 0
    for sahne_no in (1, 2, 3):
        riskli_mi = rng.random() < risk_egilimi
        if riskli_mi:
            riskli_sayac += 1
        # risk eğilimi yüksek oyuncu daha hızlı, daha az tereddütle seçer (persona davranışı
        # tutarlı olsun diye gürültü (std) sınırlı tutuluyor — aksi halde Karar1-2'deki süre/
        # değişiklik sinyali Karar3'ün riskli olup olmayacağını öngörmekte işe yaramaz hale gelir)
        sure = max(1.0, rng.gauss(14 - 8 * risk_egilimi, 2))
        degisiklik = max(0, round(rng.gauss(2 * (1 - risk_egilimi), 0.6)))
        if seviye == "Deneyimliyim":
            sure = min(sure, 60.0)
        satirlar.append({
            "oturum_id": secrets.token_hex(4),
            "kaynak": "sentetik",
            "seviye": seviye,
            "rol": rol,
            "hedef": hedef,
            "sahne_no": sahne_no,
            "karar_suresi_sn": round(sure, 1),
            "karar_degisikligi_sayisi": degisiklik,
            "riskli_sayisi_simdiye_kadar": riskli_sayac,
        })

    # aynı oturum_id tüm satırlarda kullanılsın (oturum kimliği değişmez)
    oturum_id = satirlar[0]["oturum_id"]
    kotu_son = 1 if riskli_sayac >= 2 else 0
    for s in satirlar:
        s["oturum_id"] = oturum_id
        s["kotu_son"] = kotu_son
    return satirlar


def main():
    rng = random.Random(SEED)
    satirlar = [s for _ in range(N_OTURUM) for s in uret_oturum(rng)]

    yeni_dosya = not CSV_PATH.exists()
    with CSV_PATH.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        if yeni_dosya:
            writer.writeheader()
        writer.writerows(satirlar)
    print(f"{len(satirlar)} sentetik satır ({N_OTURUM} oturum) eklendi: {CSV_PATH}")


if __name__ == "__main__":
    main()
