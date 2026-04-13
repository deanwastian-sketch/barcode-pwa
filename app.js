
const MAX_ROUNDS = 10;
let scannedArticles = [];
let userAnswers = [];
let currentBarcode = "";

document.getElementById("startBtn").addEventListener("click", () => {
    window.open("scanner.html", "_blank", "width=400,height=600");
});

// poslušamo rezultate iz scanner.html
window.addEventListener("message", function(event){
    const code = event.data.barcode;
    if(scannedArticles.includes(code)){
        alert("Artikel že bil poskeniran!");
        playBeepError();
        return;
    }
    currentBarcode = code;
    scannedArticles.push(code);
    showProductInfo(code);
    updateProgress();
});

function updateCounter() {
  const el = document.getElementById("counter");
  if (el) el.innerText = `${userAnswers.length} / ${MAX_ROUNDS}`;
}

function showProductInfo(barcode) {
  const product = products[barcode];

  document.getElementById("productInfo").style.display = "block";
  document.getElementById("answerSection").style.display = "block";

  if (!product) {
    document.getElementById("productName").innerText = "Neznan artikel";
    document.getElementById("productDesc").innerText = "EAN: " + barcode;
  } else {
    document.getElementById("productName").innerText = product.name;
    document.getElementById("productDesc").innerText = product.desc;
  }

  document.getElementById("userAnswer").focus();
}

document.getElementById("saveBtn").addEventListener("click", saveAnswer);

function saveAnswer() {
  const answer = document.getElementById("userAnswer").value.trim();
  if (!answer) { alert("Vnesi odgovor!"); return; }

  userAnswers.push({ barcode: currentBarcode, answer });
  playBeep(); // optional: pisk ob shranjevanju

  document.getElementById("userAnswer").value = "";
  document.getElementById("productInfo").style.display = "none";
  document.getElementById("answerSection").style.display = "none";

  // KONEC PO 10 VNESENIH ODGOVORIH
  if (userAnswers.length >= MAX_ROUNDS) {
    launchConfetti();
    showResults();
    // po želji: onemogoči nadaljnje skeniranje
    document.getElementById("startBtn").disabled = true;
    return;
  }
}

function saveAnswer() {
  const answer = document.getElementById("userAnswer").value.trim();
  if (!answer) { alert("Vnesi odgovor!"); return; }

  userAnswers.push({ barcode: currentBarcode, answer: answer });

  document.getElementById("userAnswer").value = "";
  document.getElementById("productInfo").style.display = "none";
  document.getElementById("answerSection").style.display = "none";

  // osveži števec + progress
  updateUIProgress();

  // konec po 10 odgovorih
  if (userAnswers.length >= MAX_ROUNDS) {
    showResults();
    document.getElementById("startBtn").disabled = true; // opcijsko
  }
}

function playBeep() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.15);
}

function playBeepError() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.3);
}

function showResults() {
  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";

  userAnswers.forEach(item => {
    const product = products[item.barcode];
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.innerText = product ? product.name : ("Neznan (" + item.barcode + ")");

    const tdAnswer = document.createElement("td");
    tdAnswer.innerText = item.answer;

    tr.appendChild(tdName);
    tr.appendChild(tdAnswer);
    tbody.appendChild(tr);
  });

  document.getElementById("resultsTable").style.display = "table";
}

function updateProgress() {
  const progress = (userAnswers.length / MAX_ROUNDS) * 100;
  document.getElementById("progressBar").style.width = progress + "%";
}
function updateUIProgress() {
  updateCounter();
  updateProgress();
}

updateUIProgress();
function launchConfetti() {
  const container = document.getElementById("confettiContainer");
  if (!container) return;

  const colors = ["#f44336", "#ffeb3b", "#4caf50", "#2196f3", "#e91e63"];

  for (let i = 0; i < 80; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() + "s";
    container.appendChild(confetti);

    setTimeout(() => confetti.remove(), 3000);
  }
}
