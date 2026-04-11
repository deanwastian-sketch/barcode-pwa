Quagga.init({
    inputStream: {
        type: "LiveStream",
        target: document.getElementById("scanner"),
        constraints: { facingMode: "environment" }
    },
    decoder: { readers: ["ean_reader","code_128_reader"] }
}, function(err){
    if(err){ alert("Napaka pri dostopu do kamere"); console.error(err); return; }
    Quagga.start();
});

Quagga.onDetected(function(result){
    const code = result.codeResult.code;
    Quagga.stop();

    // Pošlji nazaj v glavni zavihek
    if(window.opener){
        window.opener.postMessage({barcode: code}, "*");
    }
    setTimeout(()=>{ window.close(); }, 300); // zapri zavihek po skeniranju
});
