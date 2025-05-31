import { message } from "../src/utils/message.js";

const passwordInput = document.getElementById("password");
const resetBTN = document.querySelector(".reset");
const resetForm = document.querySelector(".reset-form");
const title = document.querySelector(".title");

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

const resetPassURL = `https://voteesn-api.onrender.com/api/v1/auth/reset-password?token=${token}`;

resetBTN.addEventListener("click", async (event) => {
  event.preventDefault();

  const password = passwordInput.value.trim();

  const data = {
    password,
  };

  try {
    resetBTN.disabled = true;
    await axios.post(resetPassURL, data);
    resetForm.classList.remove("show");
    resetForm.classList.add("hidden");
    title.textContent = "Password Reset Successfully! ✅";
    resetBTN.classList.add("hidden");
    setTimeout(() => {
      window.location.href = "../../login.html";
    }, 2000);
  } catch (error) {
    let shouldHideReset = false;
    resetBTN.disabled = false;
    if (error.status === 401) {
      shouldHideReset = true;
      title.textContent = "Link Expired! ⛔";
    } else if (
      error.response.data.message ===
      "Error: Token is no longer valid. Password was changed."
    ) {
      shouldHideReset = true;
      title.textContent = "Link already Used! ⛔";
    } else {
      message(error.response.data.message);
    }

    if (shouldHideReset) {
      resetForm.classList.remove("show");
      resetForm.classList.add("hidden");
      resetBTN.classList.add("hidden");
      setTimeout(() => {
        window.location.href = "../../login.html";
      }, 2000);
    }
  }
});
