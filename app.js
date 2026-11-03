const INTRO =
  "Gece yarısı bir videon beklenmedik şekilde 1 milyon izlenmeye ulaştı. Sabah hesabını açtığında yüzlerce mesaj ve bir marka işbirliği teklifi seni bekliyor.";

const KARARLAR = [
  {
    title: "Karar 1 · Strateji",
    context: "Bu viral anı nasıl değerlendireceksin?",
    hint: "İpucu: Bir videonun viral olması, o kitlenin sürekli içeriğini de istediği anlamına gelmez.",
    options: [
      {
        key: "A",
        text: "Aynı formatı art arda paylaş",
        risky: true,
        tutor: "Bu formatı tekrarlamadan önce, bu izleyici kitlesinin asıl içeriğine ilgisini nasıl ölçebilirsin?",
      },
      {
        key: "B",
        text: "Son 24 saatin izleyici verisine bak, asıl içeriğe ilgiyi ölç",
        risky: false,
        tutor: "Veriye bakman iyi bir refleks — hangi metrik sana \"bu kitle kalıcı mı\" sorusunun cevabını verir?",
      },
    ],
  },
  {
    title: "Karar 2 · Doğrulama",
    context: "Marka işbirliği teklifine ne yapacaksın?",
    hint: "İpucu: Hızlı imza kısa vadede cazip görünür ama test edilmemiş bir ürün itibarına zarar verebilir.",
    options: [
      {
        key: "A",
        text: "Teklifi hemen imzala",
        risky: true,
        tutor: "Hızlı imzaladın — ürün beklenmedik çıkarsa itibarını nasıl korursun?",
      },
      {
        key: "B",
        text: "Ürünü önce küçük bir kitleye test et",
        risky: false,
        tutor: "Küçük test iyi bir adım — kaç kişilik bir örneklem sana güvenilir bir sinyal verir dersin?",
      },
    ],
  },
  {
    title: "Karar 3 · Mahremiyet",
    context: "Hedeflemeyi iyileştirmek için takipçi konum/mesaj verisine erişen bir 3. parti analitik aracına bağlanman öneriliyor.",
    hint: "İpucu: Daha fazla veri her zaman daha iyi hedefleme getirmez; mahremiyet riskini de taşır.",
    options: [
      {
        key: "A",
        text: "Bağlan, daha iyi hedefleme için veriye ihtiyacın var",
        risky: true,
        tutor: "Bu veriye erişim vermeden önce, takipçilerinin bunu bilip bilmediğini nasıl kontrol edersin?",
      },
      {
        key: "B",
        text: "Sadece platformun anonim/agregat istatistikleriyle yetin",
        risky: false,
        tutor: "Agregat veriyle yetinmek mahremiyeti korur — bu seçim hedefleme kalitesinden ne kadar ödün verdirir sence?",
      },
    ],
  },
];

const SONUC = {
  A: {
    title: "Son A — İyi",
    text: "Takipçin kalıcı olarak büyüdü, marka ortaklığın uzun soluklu oldu, hiçbir gizlilik şikâyeti almadın.",
  },
  B: {
    title: "Son B — Kötü",
    text: "Viral an geçti, test edilmemiş ürün itibarını zedeledi, bir takipçi konum verisi paylaşımını fark edip seni ifşa etti.",
  },
};

const TIMER_SECONDS = 60;
const STORAGE_KEY = "icerikKocuState";

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function randomHex(nBytes) {
  const arr = new Uint8Array(nBytes);
  (window.crypto || window.msCrypto).getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function yeniState() {
  return {
    seviye: null,
    rol: null,
    hedef: null,
    score: 0,
    kararIndex: 0,
    oturumId: null,
    riskliSayisi: 0,
    log: [],
    karar3Override: null,
  };
}

let state = loadState() || yeniState();
let timerInterval = null;
let pendingChoice = null;
let kararAcilisZamani = 0;
let kararDegisiklikSayisi = 0;

// model.onnx: girdi 'input' float32 [1,5] = [seviye_deneyimli, sahne_no, karar_suresi_sn,
// karar_degisikligi_sayisi, riskli_sayisi_simdiye_kadar] (bkz. model/config.json → features).
// HF commit'e sabit (bkz. RELEASE.md → Yayın günlüğü). "main" değil, belirli bir commit —
// rollback tek satır (bu sabiti bir önceki commit URL'sine çevirmek).
const MODEL_URL = "https://huggingface.co/iwellike/icerik-kocu-kotu-son-riski/resolve/857ccb898162f99ae0ba1642b03cb92eb68d1c08/model.onnx";
const MODEL_ESIK = 0.5;
let ortSessionPromise = null;

function ortOturumuAl() {
  if (!ortSessionPromise) {
    // COOP/COEP başlıkları yok (basit statik sunucu) → cross-origin isolation kapalı;
    // tek iş parçacığına zorlamak, aksi halde sessizce askıda kalabilen worker/thread
    // başlatma denemesini engeller.
    ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";
    ort.env.wasm.numThreads = 1;
    ortSessionPromise = ort.InferenceSession.create(MODEL_URL);
  }
  return ortSessionPromise;
}

// Karar 2 onaylandığında çağrılır (bkz. submit-reflection). Dönen `override`, Karar 3'ün
// ipucu/süre-baskısı davranışını değiştirir (eşik: MODEL_ESIK = 0.5, bkz. spec.md).
async function modelRiskTahminiONNX(ozellikler) {
  const son = ozellikler.log[ozellikler.log.length - 1]; // sahne_no=2 satırı
  const x = new ort.Tensor(
    "float32",
    Float32Array.from([
      ozellikler.seviye === "Deneyimliyim" ? 1 : 0,
      son.sahne_no,
      son.karar_suresi_sn,
      son.karar_degisikligi_sayisi,
      son.riskli_sayisi_simdiye_kadar,
    ]),
    [1, 5]
  );
  try {
    const oturum = await ortOturumuAl();
    const cikti = await oturum.run({ input: x });
    const p = cikti.probabilities.data[1];
    const pEl = document.getElementById("model-p");
    if (pEl) pEl.textContent = p.toFixed(6);
    const override = p >= MODEL_ESIK ? { ipucuZorla: true, sureKalksin: true } : null;
    return { kotuSonRiski: p, override };
  } catch (e) {
    console.warn("model yüklenemedi, v1 davranışı (seviyeye bağlı) sürdürülüyor:", e);
    return { kotuSonRiski: null, override: null };
  }
}

async function modelRiskTahminiVarsayilan(_ozellikler) {
  return { kotuSonRiski: null, override: null };
}

window.modelRiskTahmini = typeof ort !== "undefined" ? modelRiskTahminiONNX : modelRiskTahminiVarsayilan;

// Diferansiyel test (parite) için test seam'i: ham bir özellik vektörünü doğrudan aynı
// model.onnx oturumuyla çalıştırır. bkz. cypress/e2e/model.cy.js ve tests/parite.py.
window.__onnxTahminEt = async (vektor) => {
  const oturum = await ortOturumuAl();
  const x = new ort.Tensor("float32", Float32Array.from(vektor), [1, vektor.length]);
  const cikti = await oturum.run({ input: x });
  return cikti.probabilities.data[1];
};

function gercekOturumMu() {
  return !window.Cypress;
}

function oturumuSunucuyaGonder() {
  if (!gercekOturumMu() || state.log.length === 0) return;
  const kotuSon = state.score >= 2 ? 0 : 1;
  const satirlar = state.log.map((row) => ({ ...row, kotu_son: kotuSon }));
  fetch("/api/oturum", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ satirlar }),
  }).catch(() => {
    /* sunucu yoksa (ör. statik barındırma) sessizce yok say */
  });
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.querySelectorAll(".choice-btn[data-field]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const field = btn.dataset.field;
    state[field] = btn.dataset.value;
    document.querySelectorAll(`.choice-btn[data-field="${field}"]`).forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    document.getElementById("start-btn").disabled = !(state.seviye && state.rol && state.hedef);
  });
});

document.getElementById("start-btn").addEventListener("click", () => {
  state.score = 0;
  state.kararIndex = 0;
  state.oturumId = randomHex(4);
  state.riskliSayisi = 0;
  state.log = [];
  state.karar3Override = null;
  saveState();
  openKarar(0);
});

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function openKarar(index) {
  stopTimer();
  pendingChoice = null;
  kararOnaylandi = false;
  kararDegisiklikSayisi = 0;
  kararSuresiSn = null;
  kararAcilisZamani = performance.now();
  const k = KARARLAR[index];
  const override = index === 2 ? state.karar3Override : null;

  document.getElementById("karar-step").textContent = `${index + 1}/3`;
  const introEl = document.getElementById("intro-text");
  if (index === 0) {
    introEl.textContent = INTRO;
    introEl.classList.remove("hidden");
  } else {
    introEl.classList.add("hidden");
  }
  document.getElementById("karar-title").textContent = k.title;
  document.getElementById("karar-context").textContent = k.context;

  const hintBox = document.getElementById("hint-box");
  if (state.seviye === "Yeni başlıyorum" || (override && override.ipucuZorla)) {
    hintBox.textContent = k.hint;
    hintBox.classList.remove("hidden");
  } else {
    hintBox.classList.add("hidden");
  }

  const optionsBox = document.getElementById("karar-options");
  optionsBox.innerHTML = "";
  k.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.dataset.cy = "karar-option";
    btn.dataset.key = opt.key;
    btn.textContent = opt.text;
    btn.addEventListener("click", () => chooseOption(index, opt));
    optionsBox.appendChild(btn);
  });

  document.getElementById("reflection-box").classList.add("hidden");
  document.getElementById("reflection-input").value = "";
  document.getElementById("submit-reflection").disabled = true;
  document.getElementById("tutor-box").classList.add("hidden");

  const timerEl = document.getElementById("timer");
  if (state.seviye === "Deneyimliyim" && !(override && override.sureKalksin)) {
    let remaining = TIMER_SECONDS;
    timerEl.textContent = `${remaining}s`;
    timerEl.classList.remove("hidden");
    timerInterval = setInterval(() => {
      remaining -= 1;
      timerEl.textContent = `${remaining}s`;
      if (remaining <= 0) {
        stopTimer();
        if (!pendingChoice) chooseOption(index, k.options[0]);
      }
    }, 1000);
  } else {
    timerEl.classList.add("hidden");
  }

  showScreen("screen-karar");
}

let kararOnaylandi = false;
let kararSuresiSn = null;
let karar3OverridePromise = null;

function chooseOption(index, opt) {
  if (kararOnaylandi) return;
  if (!pendingChoice) {
    kararSuresiSn = (performance.now() - kararAcilisZamani) / 1000;
  } else if (pendingChoice.key !== opt.key) {
    kararDegisiklikSayisi += 1;
  }
  pendingChoice = opt;
  stopTimer();

  document.querySelectorAll('#karar-options .choice-btn').forEach((b) => {
    b.classList.toggle("selected", b.dataset.key === opt.key);
  });
  document.getElementById("reflection-box").classList.remove("hidden");
}

document.getElementById("reflection-input").addEventListener("input", (e) => {
  document.getElementById("submit-reflection").disabled = e.target.value.trim().length === 0;
});

document.getElementById("submit-reflection").addEventListener("click", () => {
  if (!pendingChoice) return;
  const index = state.kararIndex;
  kararOnaylandi = true;

  if (!pendingChoice.risky) state.score += 1;
  else state.riskliSayisi += 1;
  state.log.push({
    oturum_id: state.oturumId,
    kaynak: "gercek",
    seviye: state.seviye,
    rol: state.rol,
    hedef: state.hedef,
    sahne_no: index + 1,
    karar_suresi_sn: Math.round(Math.min(kararSuresiSn ?? TIMER_SECONDS, TIMER_SECONDS) * 10) / 10,
    karar_degisikligi_sayisi: kararDegisiklikSayisi,
    riskli_sayisi_simdiye_kadar: state.riskliSayisi,
  });
  saveState();

  if (index === 1) {
    karar3OverridePromise = window.modelRiskTahmini({ seviye: state.seviye, log: state.log.slice() });
    karar3OverridePromise.then((sonuc) => {
      state.karar3Override = sonuc && sonuc.override;
      karar3OverrideCanliUygula();
    });
  }

  document.getElementById("reflection-box").classList.add("hidden");
  document.getElementById("tutor-text").textContent = pendingChoice.tutor;
  document.getElementById("tutor-box").classList.remove("hidden");
});

// Model, Karar 2 onaylanır onaylanmaz arka planda çalışmaya başlar (bkz. submit-reflection) ama
// bu geçişi BLOKLAMAZ — Karar 3 hemen v1 (seviyeye bağlı) davranışıyla açılır; model sonucu
// gelince (hâlâ Karar 3'teyse) ipucu/süre canlı güncellenir. Böylece her oyuncu modelin
// yüklenmesini beklemek zorunda kalmaz.
function karar3OverrideCanliUygula() {
  if (state.kararIndex !== 2) return;
  const override = state.karar3Override;
  if (!override) return;
  const hintBox = document.getElementById("hint-box");
  if (override.ipucuZorla && hintBox.classList.contains("hidden")) {
    hintBox.textContent = KARARLAR[2].hint;
    hintBox.classList.remove("hidden");
  }
  if (override.sureKalksin) {
    stopTimer();
    document.getElementById("timer").classList.add("hidden");
  }
}

document.getElementById("continue-btn").addEventListener("click", () => {
  const nextIndex = state.kararIndex + 1;
  if (nextIndex < KARARLAR.length) {
    state.kararIndex = nextIndex;
    saveState();
    openKarar(nextIndex);
  } else {
    showSon();
  }
});

function showSon() {
  const result = state.score >= 2 ? SONUC.A : SONUC.B;
  document.getElementById("son-title").textContent = result.title;
  document.getElementById("son-text").textContent = result.text;
  document.getElementById("son-score").textContent = `Puan: ${state.score}/3`;
  oturumuSunucuyaGonder();
  showScreen("screen-son");
}

document.getElementById("restart-btn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state = yeniState();
  document.querySelectorAll(".choice-btn[data-field]").forEach((b) => b.classList.remove("selected"));
  document.getElementById("start-btn").disabled = true;
  showScreen("screen-onboarding");
});

showScreen("screen-onboarding");
