let locked = false;

/* ✅();/* ✅ Potrditveni pisk ob uspešni prijavi */

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

/* ✅ Inicializacija Quagga – samo EAN */
Quagga.init(
  {
    inputStream: {
      type: "LiveStream",
      target: document.getElementById("scanner"),
      constraints: { facingMode: "environment" }
    },
    decoder: {
      readers: ["ean_reader"] // ✅ login samo z EAN
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

/* ✅ Ob uspešnem skenu prijavne kode */
Quagga.onDetected(function (result) {
  if (locked) return;

  const code = result?.codeResult?.code?.trim();
  if (!code) return;

  locked = true;
  Quagga.stop();

  // 🎵 potrditveni pisk
  playBeepSuccess();

  // Pošlji login nazaj v login.html
  if (window.opener) {
    window.opener.postMessage(
      {
        type: "login",
        barcode: code
      },
      window.location.origin
    );
  }

  // zapri okno po kratkem zamiku
  setTimeout(() => {
    window.close();
  }, 250);
});
function playBeepSuccess() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
