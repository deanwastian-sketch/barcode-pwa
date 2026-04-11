let scanning = false;

// Demo baza izdelkov
const products = {
    "1234567890123": {
        name: "Kreda Rumena",
        desc: "Set 12 kosov",
        warehouse: "Ljubljana",
        stock: 20,
        lastOrder: "2026-03-15",
        hint: "Uporabite za tablo v učilnici."
    },
    "9876543210987": {
        name: "Svinčnik HB",
        desc: "Leseni, standardni",
        warehouse: "Maribor",
        stock: 100,
        lastOrder: "2026-04-01",
        hint: "Idealno za pisanje na papir."
    }
};

function startScanner() {
    if (scanning) return;
    scanning = true;

    const scannerDiv = document.getElementById("scanner");
    scannerDiv.innerHTML = "";
    scannerDiv.style.position = "relative";

    Quagga.init({
        inputStream: {
            type: "LiveStream",
            target: scannerDiv,
            constraints: { facingMode: "environment" }
        },
        decoder: { readers: ["ean_reader", "code_128_reader"] }
    }, function(err) {
        if (err) {
            alert("Napaka pri kameri");
            scanning = false;
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        const code = result.codeResult.code;
        document.getElementById("barcodeInput").value = code;

        playBeep();
        Quagga.stop();

        // Odstranimo video
        scannerDiv.innerHTML = "";
        scanning = false;

        // Prikažemo podatke o artiklu
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
        document.getElementById("productHint").innerText = ""; // namig skrit
        infoDiv.style.display = "block";
        infoDiv.dataset.hint = product.hint; // shranimo namig v data-atribut
    } else {
        infoDiv.style.display = "none";
        alert("Artikel ni najden v bazi.");
    }
}

// Prikaže namig ob kliku na vprašaj
function showHint() {
    const infoDiv = document.getElementById("productInfo");
    const hint = infoDiv.dataset.hint;
    if (hint) {
        alert(hint);
    }
}

// Service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
