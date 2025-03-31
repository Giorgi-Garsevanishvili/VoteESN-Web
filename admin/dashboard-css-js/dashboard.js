const url = "https://voteesn-api.onrender.com/api/v1/admin/system/users";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"))
  const userInfo = document.querySelector('.user-info')

  userInfo.innerHTML = `Session with admin: ${user.name}`

  if (!token) {
    window.location.href = "../../login.html";
  }

  
});

function logOut() {
  localStorage.clear("authToken");
  localStorage.clear("user")
  window.location.href = "../../login.html";
}






