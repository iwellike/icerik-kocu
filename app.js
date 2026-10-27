const SCENARIOS = [
  {
    id: "takipci-dususu",
    title: "Takipçi Sayın Aniden Düşüyor",
    situation: (niche) =>
      `Bir hafta içinde ${niche} içeriklerinin erişimi %40 düştü. Ne yaparsın?`,
    options: [
      {
        text: "Hemen gündemdeki bir trendi birebir kopyala",
        result:
          "Trend kısa süreli ilgi çekebilir ama senin içerik kimliğinle uyumsuzsa takipçi kaybına da yol açabilir.",
        tip: "Araştır: \"içerik-marka uyumu\" ne demek, bir trendi kullanırken kendi kimliğini nasıl korursun?",
      },
      {
        text: "Son 10 gönderinin performans verisine bak, düşüşün nerede başladığını incele",
        result:
          "Veriye dayalı karar genelde daha sürdürülebilir sonuç verir — ama tek haftalık veri bazen yanıltıcı olabilir (algoritma testi, tatil dönemi gibi dışsal etkenler de olabilir).",
        tip: "Araştır: Instagram/TikTok'ta \"reach\" düşüşünün yaygın nedenleri neler?",
      },
      {
        text: "Takipçi/beğeni satın alan bir servis dene",
        result:
          "Satın alınan takipçi/beğeni gerçek etkileşim oranını düşürür; algoritma bunu fark edip içeriğini daha az önerebilir.",
        tip: "Araştır: \"engagement rate\" algoritmanın içerik dağıtım kararını nasıl etkiler?",
      },
    ],
    badge: "Erişim Dedektifi",
  },
  {
    id: "viral-patlama",
    title: "Bir İçerik Beklenmedik Şekilde Viral Oldu",
    situation: (niche) =>
      `Normalde 200 izlenme alan bir videon 500.000 izlenmeye ulaştı ama ${niche} temandan tamamen kopuk bir içerikti. Ne yaparsın?`,
    options: [
      {
        text: "Bundan sonra sadece viral olan formatı tekrar tekrar üret",
        result:
          "Kısa vadede izlenme artabilir ama hesabının asıl temasından uzaklaşırsan, seni o temadan takip edenleri kaybedebilirsin.",
        tip: "Araştır: \"izleyici kalıcılığı (audience retention)\" ile tek videoluk izlenme arasındaki fark nedir?",
      },
      {
        text: "Yeni gelen izleyicilere asıl içeriğini tanıtan bir takip videosu hazırla",
        result:
          "Viral anı, yeni gelen kalabalığı kalıcı takipçiye çevirmek için bir fırsata dönüştürme şansı yüksek bir yaklaşım.",
        tip: "Araştır: \"viral an\"ı kalıcı takipçiye çeviren içerik üreticileri hangi yöntemleri kullanıyor?",
      },
      {
        text: "Hiçbir şey yapma, kendi akışına devam et",
        result:
          "Güvenli bir seçim ama viral anın getirdiği dikkat genelde kısa sürede geçer; hiç değerlendirmemek bir fırsatı kaçırmak olabilir.",
        tip: "Araştır: platformlar viral içerik sonrası hesaba ne kadar süre fazladan görünürlük veriyor?",
      },
    ],
    badge: "Kimliğine Sadık",
  },
  {
    id: "veri-mahremiyeti",
    title: "Konum ve Yüz Paylaşımı İsteği",
    situation: (niche) =>
      `Bir marka işbirliği, canlı konumunu ve yakın çekim yüz videolarını ${niche} içeriğinde paylaşmanı istiyor; karşılığında ücret teklif ediyor. Ne yaparsın?`,
    options: [
      {
        text: "Kabul et, teklif edilen ücret iyi",
        result:
          "Kısa vadede gelir sağlar ama paylaşılan konum ve yüz verisi geri alınamaz; ileride güvenlik ya da mahremiyet riski oluşturabilir.",
        tip: "Araştır: \"dijital ayak izi\" ve paylaşılan konum verisinin uzun vadeli riskleri nedir?",
      },
      {
        text: "Konumu gizle/geciktir, yalnızca genel bölgeyi paylaş; yüz yerine ürünü öne çıkar",
        result:
          "Markanın beklediği görünürlüğü büyük ölçüde korurken kişisel veri riskini azaltan bir ara yol.",
        tip: "Araştır: içerik üreticileri marka işbirliklerinde mahremiyeti korumak için hangi teknikleri kullanıyor?",
      },
      {
        text: "Teklifi reddet",
        result:
          "Mahremiyetini tam korursun ama bu işbirliğinden gelecek geliri ve görünürlüğü de kaybedersin.",
        tip: "Araştır: marka işbirliklerinde \"sınır koyma\" ile gelir kaybı arasındaki dengeyi nasıl kurabilirsin?",
      },
    ],
    badge: "Gizlilik Bekçisi",
  },
  {
    id: "sistem-kesintisi",
    title: "Yayın Sırasında Platform Çöktü",
    situation: (niche) =>
      `Canlı yayında ${niche} takipçilerine en kritik anını gösterirken uygulama çöküyor, 10 dakika erişim kesiliyor. Ne yaparsın?`,
    options: [
      {
        text: "Sessizce bekle, yeniden bağlanınca devam et",
        result:
          "Basit bir çözüm ama izleyiciler neler olduğunu bilmeden sayfadan ayrılabilir.",
        tip: "Araştır: canlı yayın kesintilerinde izleyici kaybını azaltan \"kriz iletişimi\" yöntemleri neler?",
      },
      {
        text: "Başka bir platformdan (örn. Story) anında durumu bildir",
        result:
          "İzleyicilerle şeffaf iletişim güven oluşturur ve onları kaybetme riskini azaltır.",
        tip: "Araştır: tek platforma bağımlı olmanın (\"platform riski\") içerik üreticileri için getirdiği riskler neler?",
      },
      {
        text: "Hesabı sil, bir daha canlı yayın yapma",
        result:
          "Tek bir teknik arızadan kalıcı bir karar almak, geçici bir sorunu kalıcı bir kayba çevirebilir.",
        tip: "Araştır: büyük platformlarda kesinti ne sıklıkla yaşanıyor, bu ne kadar \"normal\" bir risk?",
      },
    ],
    badge: "Kriz Yöneticisi",
  },
];

const STORAGE_KEY = "icerikKocuState";

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { niche: null, completed: {} };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let activeScenarioId = null;
let selectedOptionIndex = null;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function renderHome() {
  document.getElementById("home-greeting").textContent = `Merhaba, ${state.niche} üreticisi!`;

  const total = SCENARIOS.length;
  const done = Object.keys(state.completed).length;
  document.getElementById("progress-fill").style.width = `${(done / total) * 100}%`;
  document.getElementById("progress-label").textContent = `${done}/${total} tamamlandı`;

  const badgeRow = document.getElementById("badge-row");
  badgeRow.innerHTML = "";
  Object.values(state.completed).forEach((entry) => {
    const pill = document.createElement("span");
    pill.className = "badge-pill";
    pill.textContent = `🏅 ${entry.badge}`;
    badgeRow.appendChild(pill);
  });

  const list = document.getElementById("scenario-list");
  list.innerHTML = "";
  SCENARIOS.forEach((sc) => {
    const isDone = !!state.completed[sc.id];
    const card = document.createElement("div");
    card.className = "scenario-card" + (isDone ? " done" : "");
    card.dataset.cy = "scenario-card";
    card.dataset.scenarioId = sc.id;
    card.innerHTML = `<span>${sc.title}</span><span class="status">${isDone ? "✓ Tamamlandı" : "Başla"}</span>`;
    card.addEventListener("click", () => openScenario(sc.id));
    list.appendChild(card);
  });

  showScreen("screen-home");
}

function openScenario(id) {
  activeScenarioId = id;
  selectedOptionIndex = null;
  const sc = SCENARIOS.find((s) => s.id === id);
  const existing = state.completed[id];

  document.getElementById("scenario-title").textContent = sc.title;
  document.getElementById("scenario-situation").textContent = sc.situation(state.niche);

  const optionsBox = document.getElementById("scenario-options");
  optionsBox.innerHTML = "";
  sc.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.dataset.cy = "scenario-option";
    btn.textContent = opt.text;
    btn.addEventListener("click", () => selectOption(i));
    optionsBox.appendChild(btn);
  });

  const reflectionBox = document.getElementById("reflection-box");
  reflectionBox.classList.add("hidden");
  document.getElementById("reflection-input").value = "";
  document.getElementById("submit-reflection").disabled = true;

  if (existing) {
    showResult(id, existing.optionIndex, false);
  } else {
    showScreen("screen-scenario");
  }
}

function selectOption(index) {
  selectedOptionIndex = index;
  document.querySelectorAll("#scenario-options .choice-btn").forEach((btn, i) => {
    btn.classList.toggle("selected", i === index);
  });
  document.getElementById("reflection-box").classList.remove("hidden");
}

document.getElementById("reflection-input").addEventListener("input", (e) => {
  document.getElementById("submit-reflection").disabled = e.target.value.trim().length === 0;
});

document.getElementById("submit-reflection").addEventListener("click", () => {
  const sc = SCENARIOS.find((s) => s.id === activeScenarioId);
  const reflection = document.getElementById("reflection-input").value.trim();

  state.completed[activeScenarioId] = {
    optionIndex: selectedOptionIndex,
    reflection,
    badge: sc.badge,
  };
  saveState(state);

  showResult(activeScenarioId, selectedOptionIndex, true);
});

function showResult(scenarioId, optionIndex, justEarned) {
  const sc = SCENARIOS.find((s) => s.id === scenarioId);
  const opt = sc.options[optionIndex];

  document.getElementById("badge-earned").textContent = justEarned
    ? `🏅 Rozet kazandın: ${sc.badge}`
    : `🏅 Rozetin: ${sc.badge}`;
  document.getElementById("result-text").textContent = opt.result;
  document.getElementById("research-tip").textContent = opt.tip;

  showScreen("screen-result");
}

document.querySelectorAll(".choice-btn[data-niche]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.niche = btn.dataset.niche;
    saveState(state);
    renderHome();
  });
});

document.getElementById("back-to-home").addEventListener("click", renderHome);
document.getElementById("back-to-home-2").addEventListener("click", renderHome);

document.getElementById("reset-btn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state = { niche: null, completed: {} };
  showScreen("screen-onboarding");
});

if (state.niche) {
  renderHome();
} else {
  showScreen("screen-onboarding");
}
