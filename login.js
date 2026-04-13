// Če je že prijavljen
if (localStorage.getItem("quiz_logged_in") === "1") {
  window.location.href = "index.html";
}

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
    localStorage.setItem("quiz_logged_in", "1");
    localStorage.setItem("quiz_user", event.data.user);
    window.location.href = "index.html";
  }
});
