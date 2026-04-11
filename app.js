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
    showResults();
    // po želji: onemogoči nadaljnje skeniranje
    document.getElementById("startBtn").disabled = true;
    return;
  }
}

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
    showResults();
    // po želji: onemogoči nadaljnje skeniranje
    document.getElementById("startBtn").disabled = true;
    return;
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

function updateProgress() {
  const progress = (userAnswers.length / MAX_ROUNDS) * 100;
  document.getElementById("progressBar").style.width = progress + "%";
}
