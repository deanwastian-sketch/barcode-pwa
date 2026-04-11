let scanning = false;
let scannedArticles = [];
let userAnswers = [];
let currentBarcode = "";

function startScanner() {
    if(scanning) return;
    scanning = true;

    const scannerDiv = document.getElementById("scanner");
    scannerDiv.innerHTML = ""; // očisti prejšnji video

    Quagga.offDetected();
    Quagga.init({
        inputStream: {
            type: "LiveStream",
            target: scannerDiv,
            constraints: { facingMode: "environment" }
        },
        decoder: { readers: ["ean_reader","code_128_reader"] }
    }, function(err){
        if(err){ 
            console.error(err); 
            alert("Napaka pri dostopu do kamere"); 
            scanning=false; 
            return; 
        }
        Quagga.start(); // kamera se zažene
    });

    Quagga.onDetected(function(result){
        const code = result.codeResult.code;
        if(scannedArticles.includes(code)){
            playBeepError();
            alert("Artikel je že bil poskeniran!");
            return;
        }
        currentBarcode = code;
        Quagga.stop(); // ustavi kamero
        scanning=false;
        playBeep();
        // Počakaj, da se video popolnoma odstrani in omogoči input
        requestAnimationFrame(() => showProductInfo(code));
    });
}

function playBeep(){
    const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
}

function playBeepError(){
    const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
}

function showProductInfo(barcode){
    const product = products[barcode];
    if(!product){ 
        alert("Artikel ni najden."); 
        return; 
    }

    const scannerDiv = document.getElementById("scanner");
    const videos = scannerDiv.querySelectorAll("video");
    videos.forEach(v => {
        v.style.display = "none"; // video skrij, pointer-events odstranimo
        v.style.pointerEvents = "none";
    });

    document.getElementById("productName").innerText = product.name;
    document.getElementById("productDesc").innerText = product.desc;
    document.getElementById("productInfo").style.display = "block";
    document.getElementById("answerSection").style.display = "block";

    scannedArticles.push(barcode);
    updateProgress();

    // fokus na input, da je takoj možno vpisovati
    document.getElementById("userAnswer").focus();
}

function saveAnswer(){
    const answer = document.getElementById("userAnswer").value.trim();
    if(!answer){
        alert("Vnesi odgovor!");
        return;
    }

    userAnswers.push({barcode: currentBarcode, answer: answer});
    document.getElementById("userAnswer").value = "";
    document.getElementById("productInfo").style.display = "none";
    document.getElementById("answerSection").style.display = "none";

    if(scannedArticles.length < Object.keys(products).length){
        startScanner(); // odpri naslednji artikel
    } else {
        showResults();
    }
}

function updateProgress(){
    const progress = (scannedArticles.length / Object.keys(products).length) * 100;
    document.getElementById("progressBar").style.width = progress + "%";
}

function showResults(){
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
