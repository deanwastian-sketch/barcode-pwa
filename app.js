function startScanner() {
    if (scanning) return;
    scanning = true;

    const scannerDiv = document.getElementById("scanner");
    scannerDiv.innerHTML = ""; // očistimo prejšnje vsebino

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

        // Overlay se ustvari po tem, ko Quagga ustvari video element
        const video = scannerDiv.querySelector("video");
        if (video) {
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
        }
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
