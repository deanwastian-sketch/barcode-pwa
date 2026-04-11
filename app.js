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

function showProductInfo(barcode){
    const product = products[barcode];
    if(!product){ alert("Artikel ni najden."); return; }

    document.getElementById("productName").innerText = product.name;
    document.getElementById("productDesc").innerText = product.desc;
    document.getElementById("productInfo").style.display = "block";
    document.getElementById("answerSection").style.display = "block";

    document.getElementById("userAnswer").focus();
}

document.getElementById("saveBtn").addEventListener("click", saveAnswer);

function saveAnswer(){
    const answer = document.getElementById("userAnswer").value.trim();
    if(!answer){ alert("Vnesi odgovor!"); return; }
    userAnswers.push({barcode: currentBarcode, answer: answer});
    document.getElementById("userAnswer").value="";
    document.getElementById("productInfo").style.display="none";
    document.getElementById("answerSection").style.display="none";

    if(scannedArticles.length === Object.keys(products).length){
        showResults();
    }
}

function showResults(){
    const tbody = document.querySelector("#resultsTable tbody");
    tbody.innerHTML = "";
    userAnswers.forEach(item=>{
        const product = products[item.barcode];
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        tdName.innerText = products[item.barcode].name;
        const tdAnswer = document.createElement("td");
        tdAnswer.innerText = item.answer;
        tr.appendChild(tdName);
        tr.appendChild(tdAnswer);
        tbody.appendChild(tr);
    });
    document.getElementById("resultsTable").style.display="table";
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

function updateProgress(){
    const progress = (scannedArticles.length / Object.keys(products).length) * 100;
    document.getElementById("progressBar").style.width = progress + "%";
}
