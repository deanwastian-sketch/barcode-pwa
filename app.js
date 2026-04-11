let scanning = false;

function startScanner() {
    if (scanning) return; // prepreči večkratni start
    scanning = true;

    const scannerDiv = document.getElementById("scanner");
    scannerDiv.innerHTML = ""; // očisti prejšnje vsebino

    // Dodamo overlay za vizualni efekt
    const overlay = document.createElement("div");
    overlay.id = "scannerOverlay";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.border = "5px solid limegreen";
    overlay.style.boxSizing = "border-box";
    overlay.style.pointerEvents = "none";
    overlay.style.opacity = "0.7";
    scannerDiv.style.position = "relative";
    scannerDiv.appendChild(overlay);

    Quagga.init({
        inputStream: {
            type: "LiveStream",
            target: scannerDiv,
            constraints: {
                facingMode: "environment"
            }
        },
        decoder: {
            readers: ["ean_reader", "code_128_reader"]
        }
    }, function(err) {
        if (err) {
            alert("Napaka pri kameri");
            scanning = false;
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        // Vpis v polje
        document.getElementById("barcodeInput").value = result.codeResult.code;

        // Zvočni signal
        playBeep();

        // Zaustavimo Quagga
        Quagga.stop();

        // Kratko obarvamo overlay, nato ga odstranimo
        overlay.style.borderColor = "green";
        setTimeout(() => {
            scannerDiv.innerHTML = "";
            scanning = false;
        }, 800);
    });
}

// Funkcija za zvočni signal
function playBeep() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1); // 0.1s pisk
}

// Registracija service workerja
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
