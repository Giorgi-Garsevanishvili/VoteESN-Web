const url = "https://voteesn-api.onrender.com/api/v1/auth/login";

const email = document.querySelector(".email-input");
const password = document.querySelector(".password-input");
const logStatus = document.querySelector(".log-status");
const logBtn = document.querySelector(".login-btn");

async function logIn(event) {
  event.preventDefault();

  logBtn.disabled = true;
  logBtn.innerHTML =
    '<img class="password-toggle" src="../img/login/loading.gif" alt="loading..." />';

  const data = {
    email: email.value,
    password: password.value,
  };
  try {
    const response = await axios.post(url, data);
    const res = response.data;
    const user = res.user
    if (user.role === "admin") {
      window.location.replace = "/dashboard";
    } else if (user.role === "voter") {
      window.location.replace = "/vote";
    } else {
      window.location.replace = "./login.html";
    }
  } catch (error) {
    logStatus.innerHTML = error.response.data.message;
  } finally {
    logBtn.disabled = false;
    logBtn.innerHTML = "Log In";
  }
}

document
  .querySelector(".login-form")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      logIn(event);
    }
  });

function togglePassword(event) {
  event.preventDefault();
  var passwordInput = document.getElementById("password");
  const eye = document.querySelector(".show-password");

  if (passwordInput.type === "password") {
    eye.innerHTML =
      '<img class="password-toggle" src="../img/login/view.png" alt="unvisible-password" />';
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
    eye.innerHTML =
      '<img class="password-toggle" src="../img/login/eye.png" alt="unvisible-password" />';
  }
}
