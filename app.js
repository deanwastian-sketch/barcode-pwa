const MAX_ROUNDS = 10;

let scannedArticles = [];
let userAnswers = [];
let currentBarcode = "";
let scanWindowOpen = false;

// --- UI helpers ---
function updateCounter() {
  const el = document.getElementById("counter");
  if (el) el.innerText = `${userAnswers.length} / ${MAX_ROUNDS}`;
}

function updateProgress() {
  const progress = (userAnswers.length / MAX_ROUNDS) * 100;
  document.getElementById("progressBar").style.width = progress + "%";
}

function updateUIProgress() {
  updateCounter();
  updateProgress();
}

// --- EAN-13 validation (checksum) ---
function isValidEAN13(code) {
  // mora biti 13 števk
  if (!/^\d{13}$/.test(code)) return false;

  // Algoritem check digit: vsota z utežmi 1 in 3 (EAN-13) [3](https://boxshot.com/barcode/tutorials/ean-13-calculator/)
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = parseInt(code[i], 10);
    sum += (i % 2 === 1) ? d * 3 : d;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(code[12], 10);
}

// --- Scanner opening ---
function openScanner() {
  if (scanWindowOpen) return;
  scanWindowOpen = true;

  // med skeniranjem naj uporabnik ne odpira več oken
  const btn = document.getElementById("startBtn");
  if (btn) btn.disabled = true;

  window.open("scanner.html", "_blank", "width=420,height=680");
}

// Gumb za skeniranje
document.getElementById("startBtn").addEventListener("click", () => {
  openScanner();
});

// --- Hard-stop handling ---
function failScanAndRetry(message) {
  playBeepError();

  alert(message);

  // skrij kartice/odgovor (če bi se slučajno kaj pokazalo)
  document.getElementById("productInfo").style.display = "none";
  document.getElementById("answerSection").style.display = "none";
  document.getElementById("userAnswer").value = "";
  currentBarcode = "";

  // ponovno odpri kamero
  setTimeout(() => openScanner(), 200);
}

// Prikaži informacije (tukaj predpostavimo, da produkt OBSTAJA)
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

  // scanner se je zaprl
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
    return failScanAndRetry("❌ Koda ni bila pravilno prebrana.\nProsim poskusi znova poskenirati ISTI artikel.");
  }

  // 2) Koda mora obstajati v bazi
  if (!products[code]) {
    return failScanAndRetry("❌ Artikel ni prepoznan (ni v bazi).\nProsim poskusi znova poskenirati ISTI artikel.");
  }

  // 3) Ne dovolimo duplikatov
  if (scannedArticles.includes(code)) {
    return failScanAndRetry("⚠️ Ta artikel je bil že poskeniran.\nProsim poskusi znova poskenirati ISTI artikel (pravilno) ali drug artikel.");
  }

  // ✅ OK – sprejmemo sken
  currentBarcode = code;
  scannedArticles.push(code);

  showProductInfo(code);

  // gumb ostane disabled dokler uporabnik ne shrani odgovora
});

// Shrani odgovor
document.getElementById("saveBtn").addEventListener("click", saveAnswer);

function saveAnswer() {
  // ne dovoli shranjevanja brez veljavnega skena
  if (!currentBarcode || !products[currentBarcode]) {
    alert("Najprej poskeniraj veljaven artikel.");
    return;
  }

  const answer = document.getElementById("userAnswer").value.trim();
  if (!answer) { alert("Vnesi odgovor!"); return; }

  userAnswers.push({ barcode: currentBarcode, answer });

  // reset UI za naslednji artikel
  document.getElementById("userAnswer").value = "";
  document.getElementById("productInfo").style.display = "none";
  document.getElementById("answerSection").style.display = "none";
  currentBarcode = "";

  updateUIProgress();

  // konec po 10 odgovorih
  if (userAnswers.length >= MAX_ROUNDS) {
    // konfete bomo urejali kasneje – a ta koda jih bo omogočila, če jih želiš
