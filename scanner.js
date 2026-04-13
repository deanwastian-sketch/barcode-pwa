let locked = false;

Quagga.init({
  inputStream: {
    type: "LiveStream",
    target: document.getElementById("scanner"),
    constraints: { facingMode: "environment" }
  },
  decoder: {
    readers: ["ean_reader"]   // ✅ samo EAN, manj “napačnih” zadetkov
  }
}, function (err) {
  if (err) {
    alert("Napaka pri dostopu do kamere");
    console.error(err);
    return;
  }
  Quagga.start();
});

Quagga.onDetected(function (result) {
  if (locked) return;

  const code = (result?.codeResult?.code || "").trim();
  if (!code) return;

  locked = true;
  Quagga.stop();

  // Pošlji nazaj v glavni zavihek (varen origin)
  if (window.opener) {
    window.opener.postMessage({ type: "scan", barcode: code }, window.location.origin);
  }

  setTimeout(() => { window.close(); }, 200);
});
