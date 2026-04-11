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
    const percent = Math.round((count / TOTAL_ARTICLES) * 100);
    progressBar.style.width = percent + "%";
    progressBar.innerText = percent + "%";
}

function startScanner() {
    if (scanning) return;
    scanning = true;

    const scannerDiv = document.getElementById("scanner");
    scannerDiv.style.display = "block";

    Quagga.offDetected();
    Quagga.init({
        inputStream: { type: "LiveStream", target: scannerDiv, constraints: { facingMode: "environment" } },
        decoder: { readers: ["ean_reader","code_128_reader"] }
    }, function(err){
        if(err){ console.error(err); alert("Napaka pri dostopu do kamere"); scanning=false; return; }
        Quagga.start();
    });

    Quagga.onDetected(function(result){
        const code = result.codeResult.code;
        if (scannedBarcodes.includes(code)) {
            playBeep(true);
            alert("Ta artikel je že bil poskeniran.");
            return;
        }
        currentBarcode = code;
        Quagga.stop();
        scanning=false;
        scannerDiv.style.display="none";
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
    if(!product){ alert("Artikel ni najden."); startScanner(); return; }

    document.getElementById("productName").innerText = product.name;
    document.getElementById("productDesc").innerText = product.desc;
    document.getElementById("productWarehouse").innerText = product.warehouse;
    document.getElementById("productStock").innerText = product.stock;
    document.getElementById("productLastOrder").innerText = product.lastOrder;
    document.getElementById("productInfo").dataset.hint = product.hint;
    document.getElementById("productInfo").style.display="block";

    document.getElementById("answerSection").style.display="block";
    document.getElementById("userAnswer").value="";
    document.getElementById("userAnswer").focus();

    playBeep();
    updateProgress();
}

function submitAnswer(){
    const answer = document.getElementById("userAnswer").value.trim();
    if(!answer){ alert("Vnesite odgovor!"); return; }

    scannedArticles.push(products[currentBarcode].name);
    scannedBarcodes.push(currentBarcode);
    userAnswers.push(answer);

    document.getElementById("productInfo").style.display="none";
    document.getElementById("answerSection").style.display="none";

    if(scannedArticles.length >= TOTAL_ARTICLES){ showResults(); }
    else { startScanner(); }
}

function showResults(){
    const resultsSection = document.getElementById("resultsSection");
    const tbody = document.getElementById("resultsTable").querySelector("tbody");
    tbody.innerHTML="";
    for(let i=0;i<scannedArticles.length;i++){
        const tr=document.createElement("tr");
        const td1=document.createElement("td"); td1.innerText=scannedArticles[i];
        const td2=document.createElement("td"); td2.innerText=userAnswers[i];
        tr.appendChild(td1); tr.appendChild(td2);
        tbody.appendChild(tr);
    }
    resultsSection.style.display="block";
    document.getElementById("instructions").innerText="Kviz končan!";
    document.getElementById("progressContainer").style.display="none";
}

function showHint(){
    const hint = document.getElementById("productInfo").dataset.hint;
    document.getElementById("modalHintText").innerText = hint;
    document.getElementById("hintModal").classList.add("
