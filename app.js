let scanning = false;

function startScanner() {
    if (scanning) return;
    scanning = true;

    const scannerDiv = document.getElementById("scanner");
    scannerDiv.innerHTML = ""; // očistimo prejšnje vsebino
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
        // Vpišemo skenirano kodo v input polje
        document.getElementById("barcodeInput").value = result.codeResult.code;

        // Kratek pisk
        playBeep();

        // Zaustavimo Quagga
        Quagga.stop();

        // Odstranimo video element in vse ostalo znotraj scannerDiv
        scannerDiv.innerHTML = "";

        scanning = false;
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

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
