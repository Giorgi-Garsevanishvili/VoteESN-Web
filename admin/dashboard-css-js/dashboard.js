document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    window.location.href = "../../login.html";
  }
});

function logOut(){
  localStorage.clear("authToken")
  window.location.href =  "../../login.html"
}
