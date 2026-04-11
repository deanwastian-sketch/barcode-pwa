let scanning = false;

function startScanner() {
    if(scanning) return;
    scanning = true;

    const scannerDiv = document.getElementById("scanner");

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
        Quagga.start();
    });

    Quagga.onDetected(function(result){
        const code = result.codeResult.code;
        Quagga.stop();
        scanning=false;
        scannerDiv.style.background = "#000"; // skrij video
        playBeep();
        showProductInfo(code);
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

function showProductInfo(barcode){
    const product = products[barcode];
    if(!product){ 
        alert("Artikel ni najden."); 
        return; 
    }

    document.getElementById("productName").innerText = product.name;
    document.getElementById("productDesc").innerText = product.desc;
    document.getElementById("productInfo").style.display = "block";
}
