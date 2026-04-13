const MAX_ROUNDS = 10;

let scannedArticles = [];
let userAnswers = [];
let currentBarcode = "";
let scanWindowOpen = false;

// ---------------- UI helpers ----------------

function updateCounter() {
  const el = document.getElementById("counter");
  if (el) el.innerText = `${userAnswers.length} / ${MAX_ROUNDS}`;
}

function updateProgress() {
  const progress = (userAnswers.length / MAX_ROUNDS) * 100;
  const bar = document.getElementById("progressBar");
  if (bar) bar.style.width = progress + "%";
}

function updateUIProgress() {
  updateCounter();
  updateProgress();
}

// Toast (če obstaja element #toast)
function showToast(message, isError = true) {
  const toast = document.getElementById("toast");
  if (!toast) {
    // fallback: če nimaš toasta, vsaj alert
    // (lahko zakomentiraš, če nočeš alertov)
    // alert(message);
    return;
  }

  toast.innerText = message;
  toast.style.background = isError ? "#b71c1c" : "#2e7d32";
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

// ---------------- Beeps ----------------

function playBeepSuccess() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();

  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.12);
}

function playBeepError() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();

  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.18, audioCtx.currentTime);

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.28);
}

// ---------------- EAN-13 validation (checksum) ----------------
// Check digit pravilo: vsota z utežmi 1/3 po prvih 12 cifrah, 13. je kontrolna.
function isValidEAN13(code) {
  if (!/^\d{13}$/.test(code)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = parseInt(code[i], 10);
    sum += (i % 2 === 1) ? d * 3 : d;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(code[12], 10);
}

// ---------------- Scanner opening ----------------

function openScanner() {
  if (scanWindowOpen) return;
  scanWindowOpen = true;

  const btn = document.getElementById("startBtn");
  if (btn) btn.disabled = true;

  window.open("scanner.html", "_blank", "width=420,height=680");
}

document.getElementById("startBtn").addEventListener("click", () => {
  openScanner();
});

// ---------------- Confetti ----------------

function launchConfetti() {
  const container = document.getElementById("confettiContainer");
  if (!container) return;

  // počisti stare konfete (da ne ostanejo v DOM-u)
  container.innerHTML = "";

  const colors = ["#f44336", "#ffeb3b", "#4caf50", "#2196f3", "#e91e63"];

  for (let i = 0; i < 120; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    const w = 6 + Math.random() * 10;
    const h = 8 + Math.random() * 14;
    confetti.style.width = w + "px";
    confetti.style.height = h + "px";

    confetti.style.animationDelay = (Math.random() * 0.6) + "s";
    confetti.style.animationDuration = (2.0 + Math.random() * 1.5) + "s";

    container.appendChild(confetti);

    setTimeout(() => confetti.remove(), 4500);
  }
}

// ---------------- Hard-stop handling ----------------

function failScanAndRetry(message) {
  playBeepError();
  showToast(message, true);

  // skrij kartice/odgovor
  const pi = document.getElementById("productInfo");
  const as = document.getElementById("answerSection");
  const ua = document.getElementById("userAnswer");

  if (pi) pi.style.display = "none";
  if (as) as.style.display = "none";
  if (ua) ua.value = "";

  currentBarcode = "";

  // ponovno odpri kamero
  setTimeout(() => openScanner(), 250);
}

function showProductInfo(barcode) {
  const product = products[barcode];

  document.getElementById("productName").innerText = product.name;
  document.getElementById("productDesc").innerText = product.desc;

  document.getElementById("productInfo").style.display = "block";
  document.getElementById("answerSection").style.display = "block";
  document.getElementById("userAnswer").focus();
}

// poslušamo rezultate iz scanner.html
window.addEventListener("message", function (event) {
  if (event.origin !== window.location.origin) return;

  // scanner okno se je zaprlo
  scanWindowOpen = false;

  const code = (event.data?.barcode || "").trim();
  if (!code) {
    // če ni kode, omogoči gumb nazaj
    const btn = document.getElementById("startBtn");
    if (btn && userAnswers.length < MAX_ROUNDS) btn.disabled = false;
    return;
  }

  // 1) EAN mora biti validen (checksum)
  if (!isValidEAN13(code)) {
    return failScanAndRetry("❌ Koda ni bila pravilno prebrana. Prosim poskusi znova poskenirati isti artikel.");
  }

  // 2) Koda mora obstajati v bazi
  if (!products[code]) {
    return failScanAndRetry("❌ Artikel ni prepoznan (ni v bazi). Prosim poskusi znova poskenirati isti artikel.");
  }

  // 3) Ne dovolimo duplikatov
  if (scannedArticles.includes(code)) {
    return failScanAndRetry("⚠️ Ta artikel je bil že poskeniran. Prosim poskusi znova poskenirati drug artikel.");
  }

  // ✅ OK – sprejmemo sken
  currentBarcode = code;
  scannedArticles.push(code);

  // ✅ potrditveni pisk za uspešen sken artikla
  playBeepSuccess();

  showProductInfo(code);

  // gumb ostane disabled dokler uporabnik ne shrani odgovora
});

// ---------------- Save Answer ----------------

document.getElementById("saveBtn").addEventListener("click", saveAnswer);

function saveAnswer() {
  // ne dovoli shranjevanja brez veljavnega skena
  if (!currentBarcode || !products[currentBarcode]) {
    showToast("Najprej poskeniraj veljaven artikel.", true);
    return;
  }

  const answer = document.getElementById("userAnswer").value.trim();
  if (!answer) {
    showToast("Vnesi odgovor!", true);
    return;
  }

  userAnswers.push({ barcode: currentBarcode, answer: answer });

  // reset UI za naslednji artikel
  document.getElementById("userAnswer").value = "";
  document.getElementById("productInfo").style.display = "none";
  document.getElementById("answerSection").style.display = "none";
  currentBarcode = "";

  updateUIProgress();

  // konec po 10 odgovorih
  if (userAnswers.length >= MAX_ROUNDS) {

  // 🎉 efekti
  launchConfetti();
  showToast("🎉 Kviz zaključen!", false);

  // ❌ skrij začetne elemente
  const hideIds = [
    "welcomeTitle",
    "introText",
    "startBtn",
    "counterContainer"
  ];
  hideIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  // ✅ pokaži zaključno sporočilo
  const finish = document.getElementById("finishMessage");
  if (finish) finish.style.display = "block";

  // ✅ pokaži rezultate
  showResults();

  return;
}

  // omogoči nov sken
  document.getElementById("startBtn").disabled = false;
}

// ---------------- Results ----------------

function showResults() {
  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";

  userAnswers.forEach(item => {
    const product = products[item.barcode];
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.innerText = product.name;

    const tdAnswer = document.createElement("td");
    tdAnswer.innerText = item.answer;

    tr.appendChild(tdName);
    tr.appendChild(tdAnswer);
    tbody.appendChild(tr);
  });

  document.getElementById("resultsTable").style.display = "table";
}

// init
updateUIProgress();
