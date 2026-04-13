const LOGIN_EANS = {
  "2002051976110": {
    name: "KATJA VIŠNJAR",
    role: "šefica"
  }
};

Quagga.init({
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: document.querySelector("#camera"),
    constraints: { facingMode: "environment" }
  },
  decoder: {
    readers: ["ean_reader"]
  }
}, err => {
  if (err) { alert("Kamera ne deluje"); return; }
  Quagga.start();
});

Quagga.onDetected(result => {
  const code = result.codeResult.code;

  if (LOGIN_EANS[code]) {
    Quagga.stop();
    if (window.opener) {
      window.opener.postMessage({
        type: "login",
        user: LOGIN_EANS[code]
      }, window.location.origin);
    }
    window.close();
  }
});
