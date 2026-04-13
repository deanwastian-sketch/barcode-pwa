let locked = false;

/* ✅ Potrditveni pisk ob uspešni prijavi */
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

/* ✅ Zelen toast */
function showSuccessToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = message;
  toast.style.display = "block";

  setTimeout(function () {
    toast.style.display = "none";
  }, 2000);
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

/* ✅ Ob uspešnem skenu prijavne EAN kode */
Quagga.onDetected(function (result) {
  if (locked) return;

  if (!result || !result.codeResult || !result.codeResult.code) return;

  const code = result.codeResult.code.trim();
  if (!code) return;

  locked = true;
  Quagga.stop();

  // ✅ UX feedback
  playBeepSuccess();
  showSuccessToast("✅ Prijava uspešna");

  // ✅ Pošlji prijavo nazaj v login.html
  if (window.opener) {
    window.opener.postMessage(
      {
        type: "login",
        barcode: code
      },
      window.location.origin
    );
  }

  // ✅ Zapri okno po kratkem zamiku
  setTimeout(function () {
    window.close();
  }, 300);
});
