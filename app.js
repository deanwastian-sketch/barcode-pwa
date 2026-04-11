let scanning = false;
let scannedArticles = [];
let scannedBarcodes = [];
let userAnswers = [];
let currentBarcode = null;

const TOTAL_ARTICLES = 4;

function updateProgress() {
    const progressText = document.getElementById("progress");
    const progressBar = document.getElementById("progressBar");
    const count = scannedArticles.length;
    progressText.innerText = `Artikel ${count + 1} / ${TOTAL_ARTICLES}`;
    const percent = Math.round(((count) / TOTAL_ARTICLES) * 100);
    progressBar.style.width = percent + "%";
    progressBar.innerText = percent + "%";
}

function startScanner() {
    if (scanning) return;
    scanning = true;

    updateProgress();

    const scannerDiv = document.getElementById("scanner");
    scannerDiv.innerHTML = "";
    scannerDiv.style.display = "block";

    Quagga.offDetected();

    Quagga.init({
        inputStream: { type: "LiveStream", target: scannerDiv, constraints: { facingMode: "environment" } },
        decoder: { readers: ["ean_reader","code_128_reader"] }
    }, function(err) {
        if (err) { console.error(err); alert("Napaka pri dostopu do kamere."); scanning=false; scannerDiv.style.display="none"; return; }
        Quagga.start();
    });

    Quagga.onDetected(function(result){
        const code = result.codeResult.code;

        if (scannedBarcodes.includes(code)) {
            playBeep(true); // drugačen pisk
            alert("Ta artikel je že bil poskeniran. Poskusite drugega.");
            return; 
        }

        currentBarcode = code;
        Quagga.stop();
        scanning = false;
        scannerDiv.style.display = "none";

        showProductInfo(code);
    });
}

function playBeep(alreadyScanned=false){
    const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(alreadyScanned?500:1000, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
}

function showProductInfo(barcode){
    const product = products[barcode];
    if(!product){ alert("Artikel ni najden v bazi. Poskusite znova."); return startScanner(); }

    document.getElementById("productName").innerText = product.name;
    document.getElementById("productDesc").innerText = product.desc;
    document.getElementById("productWarehouse").innerText = product.warehouse;
    document.getElementById("productStock").innerText = product.stock;
    document.getElementById("productLastOrder").innerText = product.lastOrder;
    document.getElementById("productInfo").dataset.hint = product.hint;
    document.getElementById("productInfo").style.display = "block";

    document.getElementById("answerSection").style.display = "block";
    const answerInput = document.getElementById("userAnswer");
    answerInput.value="";
    answerInput.focus();

    playBeep();
    updateProgress();
}

function submitAnswer(){
    const answerInput = document.getElementById("userAnswer");
    const answer = answerInput.value.trim();
    if(!answer){ alert("Prosimo, vnesite vaš odgovor!"); return; }

    scannedArticles.push(products[currentBarcode].name);
    scannedBarcodes.push(currentBarcode);
    userAnswers.push(answer);

    document.getElementById("answerSection").style.display="none";
    document.getElementById("productInfo").style.display="none";

    if(scannedArticles.length >= TOTAL_ARTICLES){ showResults(); }
    else { startScanner(); }
}

function showResults(){
    const resultsSection = document.getElementById("resultsSection");
    const resultsTable = document.getElementById("resultsTable").querySelector("tbody");
    resultsTable.innerHTML="";

    for(let i=0;i<scannedArticles.length;i++){
        const row = document.createElement("tr");
        const cellArticle=document.createElement("td");
        const cellAnswer=document.createElement("td");
        cell
