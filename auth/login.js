import { checkRole, getAuthConfig } from "../src/handlers/authHandler.js";
import { message } from "../src/utils/message.js";

const url = "https://voteesn-api.onrender.com/api/v1/auth/login";

const email = document.querySelector(".email-input");
const password = document.querySelector(".password-input");
const logBtn = document.querySelector(".login-btn");
const forgotPassword = document.querySelector(".forgot-password");
const modal = document.getElementById("revealModal");
const cancel = document.querySelector(".modal-cancel");
const resetPassword = document.querySelector(".modal-proceed");
const emailInput = document.getElementById("email");

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

  document.querySelector(".side-message").style.display = "block";

  setTimeout(() => {
    document.querySelector(".side-message").style.display = "none";
  }, 15000);

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

forgotPassword.addEventListener("click", (event) => {
  event.preventDefault();

  modal.classList.remove("hidden");
  modal.classList.add("show");
});

cancel.addEventListener("click", (event) => {
  event.preventDefault();

  modal.classList.remove("show");
  modal.classList.add("hidden");
});

resetPassword.addEventListener("click", async (event) => {
  event.preventDefault();
  const requestURL = `https://voteesn-api.onrender.com/api/v1/auth/reset-password-request`;
  const email = emailInput.value;

  const body = {
    email: email
  }

  try {
    resetPassword.disabled = true;
    cancel.disabled = true;
    await axios.post(requestURL, body);
    message("Reset Link Sent To Your Email", "OK", 2000);
    setTimeout(() => {
      location.reload();
    }, 2000);
  } catch (error) {
    resetPassword.disabled = false;
    cancel.disabled = false;
    message(error.response.data.message);
  }
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
