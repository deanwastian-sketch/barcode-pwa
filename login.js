document.getElementById("loginBtn").addEventListener("click", () => {
  window.open(
    "login_scanner.html",
    "_blank",
    "width=420,height=680"
  );
});

// poslušaj prijavni EAN
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;

  if (event.data?.type === "login") {
    // brez localStorage!
    window.location.href = "index.html";
  }
});
