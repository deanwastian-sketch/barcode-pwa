let scanning = false;

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

        // Počakamo, da Quagga ustvari video element
        const observer = new MutationObserver(() => {
            const video = scannerDiv.querySelector("video");
            if (video) {
                // ustvarimo overlay
                const overlay = document.createElement("div");
                overlay.id = "scannerOverlay";
                overlay.style.position = "absolute";
                overlay.style.top = video.offsetTop + "px";
                overlay.style.left = video.offsetLeft + "px";
                overlay.style.width = video.offsetWidth + "px";
                overlay.style.height = video.offsetHeight + "px";
                overlay.style.border = "5px solid red";
                overlay.style.boxSizing = "border-box";
                overlay.style.pointerEvents = "none";
                overlay.style.opacity = "0.7";
                scannerDiv.appendChild(overlay);

                // observer ni več potreben
                observer.disconnect();
            }
        });
        observer.observe(scannerDiv, { childList: true });
    });

    Quagga.onDetected(function(result) {
        document.getElementById("barcodeInput").value = result.codeResult.code;
        playBeep();
        Quagga.stop();

        const overlay = document.getElementById("scannerOverlay");
        if (overlay) overlay.remove();

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
