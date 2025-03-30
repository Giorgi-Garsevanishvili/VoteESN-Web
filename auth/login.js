function togglePassword(event) {
  event.preventDefault();
  var passwordInput = document.getElementById("password");
  const eye = document.querySelector(".show-password");

  if (passwordInput.type === "password") {
    eye.innerHTML = '<img class="password-toggle" src="../img/login/view.png" alt="unvisible-password" />'
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
    eye.innerHTML = '<img class="password-toggle" src="../img/login/eye.png" alt="unvisible-password" />';
  }
}
