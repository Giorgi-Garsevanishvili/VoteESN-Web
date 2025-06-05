// Login functionality for the VoteESN application
import { checkRole, getAuthConfig } from "../src/handlers/authHandler.js";
import { message } from "../src/utils/message.js";

// url for the login API endpoint
const url = "https://voteesn-api.onrender.com/api/v1/auth/login";

// Selectors for the login form elements
const email = document.querySelector(".email-input");
const password = document.querySelector(".password-input");
const logBtn = document.querySelector(".login-btn");
const forgotPassword = document.querySelector(".forgot-password");
const modal = document.getElementById("revealModal");
const cancel = document.querySelector(".modal-cancel");
const resetPassword = document.querySelector(".modal-proceed");
const emailInput = document.getElementById("email");
const togglePasswordBtn = document.querySelector(".show-password");
const consentCheckBox = document.getElementById("consentCheckbox");

// Event listener for the consent checkbox
// Enables or disables the login button based on the checkbox state
consentCheckBox.addEventListener("change", () => {
  logBtn.disabled = !consentCheckBox.checked;
});

// Event listener for the login form submission
document
  .querySelector(".login-form")
  .addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
      await logIn(event);
    }
  });

// Event listener for the login button click
logBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  await logIn(event);
});

// Check for any error messages stored in localStorage
// and display them if present
const errorStorage = localStorage.getItem("error");

// Get the authentication token from localStorage
const { token } = getAuthConfig();

// If a token exists, check the user's role
if (token) {
  checkRole();
}

// If there is an error message in localStorage, display it
if (errorStorage) {
  message(errorStorage);
  localStorage.clear();
}

// Function to handle the login process
/**
 * Handles the login process by sending a request to the server
 * with the user's email and password.
 * Displays appropriate messages based on the response.
 * sets the user data and token in localStorage
 * lands the user to the appropriate page based on their role.
 */
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
    consentAccepted: consentCheckBox.checked,
  };

  if (!data.consentAccepted) {
    logBtn.disabled = false;
    logBtn.innerHTML = "Log In";
    return message("Please accept the Terms and Conditions to login.");
  }

  if (!data.email || !data.password) {
    logBtn.disabled = false;
    logBtn.innerHTML = "Log In";
    return message("Email and Password must be presented", "error", 4000);
  }

  if (!consentCheckBox.checked) {
    logBtn.disabled = false;
    logBtn.innerHTML = "Log In";
    message("Please accept the Terms and Conditions to login.");
    return;
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

// Event listeners for the toggle password visibility and forgot password functionality

// Event listener for the toggle password visibility button
togglePasswordBtn.addEventListener("click", (event) => {
  event.preventDefault();
  togglePassword();
});

// Event listeners for the forgot password modal functionality
forgotPassword.addEventListener("click", (event) => {
  event.preventDefault();

  modal.classList.remove("hidden");
  modal.classList.add("show");
});

// Event listener for the cancel button in the modal
cancel.addEventListener("click", (event) => {
  event.preventDefault();

  modal.classList.remove("show");
  modal.classList.add("hidden");
});

// Event listener for the reset password button in the modal
// Sends a request to reset the password
// and displays a message based on the response
resetPassword.addEventListener("click", async (event) => {
  event.preventDefault();
  const requestURL = `https://voteesn-api.onrender.com/api/v1/auth/reset-password-request`;
  const email = emailInput.value;

  const body = {
    email: email,
  };

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

// Function to toggle the visibility of the password input field
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
