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
        showProductInfo(code);
    });
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
