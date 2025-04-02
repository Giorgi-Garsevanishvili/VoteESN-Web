import { message } from "../utils/message.js";

const url = "https://voteesn-api.onrender.com/api/v1/auth/login";

const email = document.querySelector(".email-input");
const password = document.querySelector(".password-input");
const logStatus = document.querySelector(".log-status");
const logBtn = document.querySelector(".login-btn");

logBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  await logIn(event);
});

const token = localStorage.getItem("authToken");
const errorStorage = localStorage.getItem("error");

if (token) {
  window.location.href = "./admin/dashboard.html";
}

if (errorStorage) {
  message(errorStorage);
  localStorage.clear();
}

async function logIn(event) {
  event.preventDefault();

  logBtn.disabled = true;
  logBtn.innerHTML =
    '<img class="password-toggle" src="../img/login/loading.gif" alt="loading..." />';

  const data = {
    email: email.value.trim(),
    password: password.value.trim(),
  };

  if (!data) {
    logStatus.innerHTML = "email and password must be presenter";
  }

  try {
    const response = await axios.post(url, data);
    const res = response.data;
    const user = res.user;

    if (res.token) {
      localStorage.setItem("authToken", res.token);
    }

    if (user.name) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    if (user.role === "admin") {
      window.location.href = "./admin/dashboard.html";
    } else if (user.role === "voter") {
      window.location.href = "/vote";
    } else {
      window.location.href = "./login.html";
    }
  } catch (error) {
    message(error.response.data.message);
  } finally {
    logBtn.disabled = false;
    logBtn.innerHTML = "Log In";
  }
}

document
  .querySelector(".login-form")
  .addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
      await logIn(event);
    }
  });

const togglePasswordBtn = document.querySelector(".show-password");

togglePasswordBtn.addEventListener("click", (event) => {
  event.preventDefault();
  togglePassword();
});

function togglePassword() {
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
