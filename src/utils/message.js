export function message(text, style, time) {
  const messageBox = document.querySelector('.message')
  messageBox.innerHTML = text
  const errorDiv = document.querySelector(".message");
  errorDiv.classList.remove("hidden");
  errorDiv.classList.add("show");

  if(style === 'OK'){
    errorDiv.classList.remove('error')
    errorDiv.classList.add('OK')
  } else {
    errorDiv.classList.remove("OK")
    errorDiv.classList.add("error")
  }

  if(!time){
    time = 5000; 
  }

  setTimeout(() => {
    errorDiv.classList.remove('show')
    errorDiv.classList.add('hidden')
  }, time);
}