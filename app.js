let scanning = false;

function startScanner() {
    if (scanning) return;
    scanning = true;

    const scannerDiv = document.getElementById("scanner");
    scannerDiv.innerHTML = ""; // očisti vsebino
    scannerDiv.style.background = "#000"; // črn background samo med skeniranjem
    scannerDiv.style.display = "block"; // poskrbi, da je viden

    Quagga.init({
        inputStream: {
            type: "LiveStream",
            target: scannerDiv,
            constraints: { facingMode: "environment" },
            area: { // pokrije celoten div
                top: "0%",
                right: "0%",
                left: "0%",
                bottom: "0%"
            }
        },
        decoder: { readers: ["ean_reader", "code_128_reader"] }
    }, function(err) {
        if (err) {
            console.error("Napaka pri inicializaciji kamere:", err);
            alert("Napaka pri dostopu do kamere. Preverite dovoljenja.");
            scanning = false;
            scannerDiv.style.background = "none";
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        const code = result.codeResult.code;
        document.getElementById("barcodeInput").value = code;

        playBeep();
        Quagga.stop();

        // očisti video
        scannerDiv.innerHTML = "";
        scannerDiv.style.background = "none"; // odstranimo črn kvadrat
        scanning = false;

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

    if (product) {
        document.getElementById("productName").innerText = product.name;
        document.getElementById("productDesc").innerText = product.desc;
        document.getElementById("productWarehouse").innerText = product.warehouse;
        document.getElementById("productStock").innerText = product.stock;
        document.getElementById("productLastOrder").innerText = product.lastOrder;
        document.getElementById("productHint").innerText = "";
        infoDiv.style.display = "block";
        infoDiv.dataset.hint = product.hint;
    } else {
        infoDiv.style.display = "none";
        alert("Artikel ni najden v bazi.");
    }
}

function showHint() {
    const infoDiv = document.getElementById("productInfo");
    const hint = infoDiv.dataset.hint;
    if (hint) {
        alert(hint);
    }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
