let locked = false;

function playBeepSuccess() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();

  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.12);
}

Quagga.init(
  {
    inputStream: {
      type: "LiveStream",
      target: document.getElementById("scanner"),
      constraints: { facingMode: "environment" }
    },
    decoder: {
      readers: ["ean_reader"]
    }
  },
  function (err) {
    if (err) {
      alert("Napaka pri dostopu do kamere");
      console.error(err);
      return;
    }
    Quagga.start();
  }
);

Quagga.onDetected(function (result) {
  if (locked) return;

  const code = result && result.codeResult && result.codeResult.code;
  if (!code) return;

  locked = true;
  Quagga.stop();

  playBeepSuccess();

  if (window.opener) {
    window.opener.postMessage(
      { type: "login", barcode: code },
      window.location.origin
    );
  }

  setTimeout(function () {
    window.close();
  }, 250);
});
