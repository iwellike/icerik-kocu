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

let state = loadState() || { seviye: null, rol: null, hedef: null, score: 0, kararIndex: 0 };
let timerInterval = null;
let pendingChoice = null;

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
  const k = KARARLAR[index];

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
  if (state.seviye === "Yeni başlıyorum") {
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
  if (state.seviye === "Deneyimliyim") {
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

function chooseOption(index, opt) {
  if (pendingChoice) return;
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

  if (!pendingChoice.risky) state.score += 1;
  saveState();

  document.getElementById("reflection-box").classList.add("hidden");
  document.getElementById("tutor-text").textContent = pendingChoice.tutor;
  document.getElementById("tutor-box").classList.remove("hidden");
});

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
  showScreen("screen-son");
}

document.getElementById("restart-btn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state = { seviye: null, rol: null, hedef: null, score: 0, kararIndex: 0 };
  document.querySelectorAll(".choice-btn[data-field]").forEach((b) => b.classList.remove("selected"));
  document.getElementById("start-btn").disabled = true;
  showScreen("screen-onboarding");
});

showScreen("screen-onboarding");
