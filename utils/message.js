export function message(text) {
  const messageBox = document.querySelector('.message')
  messageBox.innerHTML = text
  const errorDiv = document.querySelector(".message");
  errorDiv.classList.remove("hidden");
  errorDiv.classList.add("show");

  setTimeout(() => {
    errorDiv.classList.remove('show')
    errorDiv.classList.add('hidden')
  }, 5000);
}