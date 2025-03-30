const url = "https://voteesn-api.onrender.com/api/v1/auth/login";

const email = document.querySelector(".email-input");
const password = document.querySelector(".password-input");
const logStatus = document.querySelector(".log-status")

async function logIn(event) {
  event.preventDefault();

  const data = {
    email: email.value,
    password: password.value,
  };

  await axios
    .post(url, data)
    .then((response) => {
      const user = response.data
      logStatus.innerHTML = `success: ${user.user.name}`
    })
    .catch((error) => {
      logStatus.innerHTML = error.response.data.message
    });
}

document.querySelector('.login-form').addEventListener('keydown', function(event){
  if(event.key === "Enter"){
    logIn(event);
  }
})

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
