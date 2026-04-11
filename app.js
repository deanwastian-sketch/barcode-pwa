function startScanner() {
    if(scanning) return;
    scanning = true;

    const scannerDiv = document.getElementById("scanner");
    scannerDiv.style.opacity = 1; // postane vidno
    scannerDiv.style.display = "block";

    Quagga.init({
        inputStream: {
            type: "LiveStream",
            target: scannerDiv,
            constraints: { facingMode: "environment" }
        },
        decoder: { readers: ["ean_reader","code_128_reader"] }
    }, function(err){
        if(err){ console.error(err); alert("Napaka pri dostopu do kamere"); scanning=false; return; }
        Quagga.start();
    });

    Quagga.onDetected(function(result){
        const code = result.codeResult.code;
        Quagga.stop();
        scanning=false;
        scannerDiv.style.opacity=0;

        alert("Skenirano: " + code);
    });
}
