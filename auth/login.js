import { checkRole, getAuthConfig } from "../src/handlers/authHandler.js";
import { message } from "../src/utils/message.js";

const url = "https://voteesn-api.onrender.com/api/v1/auth/login";

const email = document.querySelector(".email-input");
const password = document.querySelector(".password-input");
const logBtn = document.querySelector(".login-btn");

logBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  await logIn(event);
});

const errorStorage = localStorage.getItem("error");
const { token } = getAuthConfig();

if (token) {
  checkRole();
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

  if (!data.email || !data.password) {
    logBtn.disabled = false;
    logBtn.innerHTML = "Log In";
    return message("Email and Password must be presented", "error", 4000);
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
      window.location.href = "../src/views/dashboard.html";
    } else if (user.role === "voter") {
      window.location.href = "../src/views/vote.html";
    } else {
      window.location.href = "../../login.html";
    }
  } catch (error) {
    message(error.response.data.message);
  } finally {
    logBtn.disabled = false;
    logBtn.innerHTML = "Log In";
    email.value = "";
    password.value = "";
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
      '<img class="password-toggle" src="../../img/login/eye.svg" alt="unvisible-password" />';
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
    eye.innerHTML =
      '<img class="password-toggle" src="../../img/login/eye-closed.svg" alt="unvisible-password" />';
  }
}
