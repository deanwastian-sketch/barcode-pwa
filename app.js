const MAX_ROUNDS = 10;

let scannedArticles = [];
let userAnswers = [];
let currentBarcode = "";
let scanWindowOpen = false;

// ---------------- UI helpers ----------------

function updateCounter() {
  const el = document.getElementById("counter");
  if (el) el.innerText = userAnswers.length + " / " + MAX_ROUNDS;
}

function updateProgress() {
  const bar = document.getElementById("progressBar");
  if (!bar) return;
  const progress = (userAnswers.length / MAX_ROUNDS) * 100;
  bar.style.width = progress + "%";
}

function updateUIProgress() {
  updateCounter();
  updateProgress();
}

// Toast (če obstaja element #toast)
function showToast(message, isError) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = message;
  toast.style.background = isError ? "#b71c1c" : "#2e7d32";
  toast.style.display = "block";

  setTimeout(function () {
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

const startBtn = document.getElementById("startBtn");
if (startBtn) {
  startBtn.addEventListener("click", function () {
    openScanner();
  });
}

// ---------------- Confetti ----------------

function launchConfetti() {
  const container = document.getElementById("confettiContainer");
  if (!container) return;

  container.innerHTML = "";

  const colors = ["#f44336", "#ffeb3b", "#4caf50", "#2196f3", "#e91e63"];

  for (let i = 0; i < 120; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    confetti.style.left = (Math.random() * 100) + "vw";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    const w = 6 + Math.random() * 10;
    const h = 8 + Math.random() * 14;
    confetti.style.width = w + "px";
    confetti.style.height = h + "px";

    confetti.style.animationDelay = (Math.random() * 0.6) + "s";
    confetti.style.animationDuration = (2.0 + Math.random() * 1.5) + "s";

    container.appendChild(confetti);

    setTimeout(function () {
      confetti.remove();
    }, 4500);
  }
}

// ---------------- Finish button logic ----------------

function showFinishView() {
  // Skrij začetne elemente
  const hideIds = ["welcomeTitle", "introText", "startBtn", "counterContainer"];
  for (let i = 0; i < hideIds.length; i++) {
    const el = document.getElementById(hideIds[i]);
    if (el) el.style.display = "none";
  }

  // Skrij še produktni UI, če je slučajno viden
  const pi = document.getElementById("productInfo");
  const as = document.getElementById("answerSection");
  if (pi) pi.style.display = "none";
  if (as) as.style.display = "none";

  // Pokaži finish message
  const finish = document.getElementById("finishMessage");
  if (finish) finish.style.display = "block";

  }

// ---------------- Hard-stop handling ----------------

function failScanAndRetry(message) {
  playBeepError();
  showPersistentError(message);

  // skrij kartice/odgovor
  const pi = document.getElementById("productInfo");
  const as = document.getElementById("answerSection");
  const ua = document.getElementById("userAnswer");

  if (pi) pi.style.display = "none";
  if (as) as.style.display = "none";
  if (ua) ua.value = "";

  currentBarcode = "";

  // ponovno odpri kamero
  setTimeout(function () {
    openScanner();
  }, 250);
}

function showProductInfo(barcode) {
  const product = products[barcode];

  document.getElementById("productName").innerText = product.naziv;
  document.getElementById("productDesc").innerText = product.opis;

  document.getElementById("productSkladisce").innerText = product.skladisce;
  document.getElementById("productZaloga").innerText = product.Zaloga;
  document.getElementById("productNarocilo").innerText = product.Zadnje_narocilo;

  // Namig – samo prek gumba
  const hintBtn = document.getElementById("hintBtn");
  hintBtn.onclick = function () {
    showHint(product.Namig);
  };

  document.getElementById("productInfo").style.display = "block";
  document.getElementById("answerSection").style.display = "block";
  document.getElementById("userAnswer").focus();
}

// poslušamo rezultate iz scanner.html
window.addEventListener("message", function (event) {
  if (event.origin !== window.location.origin) return;

  scanWindowOpen = false;

  // event.data lahko ima različne oblike – poskrbimo za varnost
  const data = event.data || {};
  const code = (data.barcode || "").toString().trim();

  if (!code) {
    const btn = document.getElementById("startBtn");
    if (btn && userAnswers.length < MAX_ROUNDS) btn.disabled = false;
    return;
  }

  // 1) EAN mora biti validen (checksum)
  if (!isValidEAN13(code)) {
    return failScanAndRetry("❌ Ejej, napaka! Probaj še enkrat 🤣 Če ne bo šlo pa napiši ticket.");
  }

  // 2) Koda mora obstajati v bazi
  if (!products[code]) {
    return failScanAndRetry("❌ Ejej, napaka! Probaj še enkrat 🤣 Če ne bo šlo pa napiši ticket.");
  }

  // 3) Ne dovolimo duplikatov
  if (scannedArticles.indexOf(code) !== -1) {
    return failScanAndRetry("⚠️ Veš kaj! Ta artikel si pa že poskenirala in ugibala! Kar daj naslednjega.");
  }

  // ✅ OK – sprejmemo sken
  currentBarcode = code;
  scannedArticles.push(code);

  // ✅ potrditveni pisk
  playBeepSuccess();

  showProductInfo(code);

  // gumb ostane disabled dokler uporabnik ne shrani odgovora
});

// ---------------- Save Answer ----------------

const saveBtn = document.getElementById("saveBtn");
if (saveBtn) saveBtn.addEventListener("click", saveAnswer);

function saveAnswer() {
  if (!currentBarcode || !products[currentBarcode]) {
    showToast("Najprej poskeniraj veljaven artikel.", true);
    return;
  }

  const ua = document.getElementById("userAnswer");
  const answer = ua ? ua.value.trim() : "";
  if (!answer) {
    showToast("Vnesi odgovor!", true);
    return;
  }

  userAnswers.push({ barcode: currentBarcode, answer: answer });

  // reset UI za naslednji artikel
  if (ua) ua.value = "";
  const pi = document.getElementById("productInfo");
  const as = document.getElementById("answerSection");
  if (pi) pi.style.display = "none";
  if (as) as.style.display = "none";
  currentBarcode = "";

  updateUIProgress();

  // konec po 10 odgovorih
  if (userAnswers.length >= MAX_ROUNDS) {
    launchConfetti();
    showToast("🎉 Kviz zaključen!", false);

    // Preklopi v zaključni prikaz
    showFinishView();

    // Pokaži rezultate (tabela)
    showResults();

    return;
  }

  // omogoči nov sken
  const btn = document.getElementById("startBtn");
  if (btn) btn.disabled = false;
}

// ---------------- Results ----------------

function showResults() {
  const tbody = document.querySelector("#resultsTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  for (let i = 0; i < userAnswers.length; i++) {
    const item = userAnswers[i];
    const product = products[item.barcode];

    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.innerText = product ? (product.naziv || product.name || item.barcode) : item.barcode;
    
    const tdAnswer = document.createElement("td");
    tdAnswer.innerText = item.answer;

    tr.appendChild(tdName);
    tr.appendChild(tdAnswer);
    tbody.appendChild(tr);
  }

  const table = document.getElementById("resultsTable");
  if (table) table.style.display = "table";
}

function showHint(text) {
  if (!text) {
    showToast("Namig za ta artikel ni na voljo.", true);
    return;
  }

  // uporabi toast ali alert – tu je toast varianta
  showToast("❓ Namig: " + text, false);
}

function showPersistentError(message) {
  const overlay = document.getElementById("errorOverlay");
  const text = document.getElementById("errorText");
  const closeBtn = document.getElementById("closeErrorBtn");

  if (!overlay || !text || !closeBtn) return;

  text.innerText = message;
  overlay.style.display = "flex";

  closeBtn.onclick = function () {
    overlay.style.display = "none";
  };
}

// init
updateUIProgress();
