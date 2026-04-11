let scanning = false;
let scannedArticles = [];
let scannedBarcodes = [];
let userAnswers = [];
let currentBarcode = null;

const TOTAL_ARTICLES = 4;

function updateProgress() {
    document.getElementById("progress").innerText = `Artikel ${scannedArticles.length + 1} / ${TOTAL_ARTICLES}`;
}

function startScanner() {
    if (scanning) return;
    scanning = true;

    updateProgress();

    const scannerDiv = document.getElementById("scanner");
    scannerDiv.innerHTML = "";
    scannerDiv.style.display = "block";

    Quagga.init({
        inputStream: { type: "LiveStream", target: scannerDiv, constraints: { facingMode: "environment" } },
        decoder: { readers: ["ean_reader", "code_128_reader"] }
    }, function(err) {
        if (err) {
            console.error(err);
            alert("Napaka pri dostopu do kamere. Preverite dovoljenja.");
            scanning = false;
            scannerDiv.style.display = "none";
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        const code = result.codeResult.code;
        currentBarcode = code;

        Quagga.stop();
        scanning = false;
        scannerDiv.innerHTML = "";
        scannerDiv.style.display = "none";

        showProductInfo(code);
    });
}

function playBeep() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

function showProductInfo(barcode) {
    const infoDiv = document.getElementById("productInfo");
    const product = products[barcode];

    if (!product) {
        alert("Artikel ni najden v bazi. Poskusite znova.");
        startScanner();
        return;
    }

    if (scannedBarcodes.includes(barcode)) {
        alert("Ta artikel je že bil poskeniran. Poskusite drugega.");
        startScanner();
        return;
    }

    currentBarcode = barcode;
    scannedBarcodes.push(barcode);

    document.getElementById("productName").innerText = product.name;
    document.getElementById("productDesc").innerText = product.desc;
    document.getElementById("productWarehouse").innerText = product.warehouse;
    document.getElementById("productStock").innerText = product.stock;
    document.getElementById("productLastOrder").innerText = product.lastOrder;
    document.getElementById("productHint").innerText = "";
    infoDiv.dataset.hint = product.hint;
    infoDiv.style.display = "block";

    document.getElementById("answerSection").style.display = "block";
    const answerInput = document.getElementById("userAnswer");
    answerInput.value = "";
    answerInput.focus();

    updateProgress();
}

function submitAnswer() {
    const answerInput = document.getElementById("userAnswer");
    const answer = answerInput.value.trim();
    if (!answer) {
        alert("Prosimo, vnesite vaš odgovor!");
        return;
    }

    const product = products[currentBarcode];
    if (!product) return;

    scannedArticles.push(product.name);
    userAnswers.push(answer);

    document.getElementById("answerSection").style.display = "none";
    document.getElementById("productInfo").style.display = "none";

    if (scannedArticles.length >= TOTAL_ARTICLES) {
        showResults();
    } else {
        startScanner();
    }
}

function showResults() {
    const resultsSection = document.getElementById("resultsSection");
    const resultsTable = document.getElementById("resultsTable");
    resultsTable.innerHTML = "";

    for (let i = 0; i < scannedArticles.length; i++) {
        const row = document.createElement("tr");
        const cellArticle = document.createElement("td");
        const cellAnswer = document.createElement("td");
        cellArticle.innerText = scannedArticles[i];
        cellAnswer.innerText = userAnswers[i];
        row.appendChild(cellArticle);
        row.appendChild(cellAnswer);
        resultsTable.appendChild(row);
    }

    resultsSection.style.display = "block";
    alert("Vsi odgovori so zabeleženi. Preverite rezultate spodaj.");
}

function showHint() {
    const infoDiv = document.getElementById("productInfo");
    const hint = infoDiv.dataset.hint;
    if (!hint) return;

    const modal = document.getElementById("hintModal");
    const modalText = document.getElementById("modalHintText");
    const closeBtn = modal.querySelector(".closeBtn");

    modalText.innerText = hint;
    modal.classList.add("show");

    closeBtn.onclick = function() { modal.classList.remove("show"); }
    window.onclick = function(event) { if (event.target === modal) modal.classList.remove("show"); }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
