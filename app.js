function startScanner() {
  Quagga.init({
    inputStream: {
      type: "LiveStream",
      target: document.querySelector('#scanner'),
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
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected(function(result) {
    document.getElementById("barcodeInput").value = result.codeResult.code;
    Quagga.stop();
  });
}

// registracija service workerja
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}