function startScanner() {
    console.log("startScanner called");
    if (scanning) return;
    scanning = true;

    updateProgress();

    const scannerDiv = document.getElementById("scanner");
    scannerDiv.innerHTML = "";
    scannerDiv.style.display = "block"; // pokažemo div šele, ko se kamera zažene

    // odstranimo prejšnje handlerje
    Quagga.offDetected();

    Quagga.init({
        inputStream: { 
            type: "LiveStream", 
            target: scannerDiv, 
            constraints: { facingMode: "environment" } 
        },
        decoder: { readers: ["ean_reader","code_128_reader"] }
    }, function(err) {
        if (err) {
            console.error(err);
            alert("Napaka pri dostopu do kamere. Preverite dovoljenja.");
            scanning = false;
            scannerDiv.style.display = "none";
            return;
        }
        console.log("Quagga.start()");
        Quagga.start();
    });

    Quagga.onDetected(function(result){
        console.log("Detected code:", result.codeResult.code);
        const code = result.codeResult.code;

        if (scannedBarcodes.includes(code)) {
            playBeep(true);
            alert("Ta artikel je že bil poskeniran.");
            return; 
        }

        currentBarcode = code;
        Quagga.stop();
        scanning = false;
        scannerDiv.style.display = "none";

        showProductInfo(code);
    });
}
