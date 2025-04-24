import QrScanner from "../../lib/qr-scanner.min.js";
import { logOut } from "../../auth/logout.js";
import { checkAuth, config } from "../handlers/authHandler.js";
import { message } from "../utils/message.js";

const url = `https://voteesn-api.onrender.com/api/v1/user/voter`;

const logOutBtn = document.querySelector(".log-out");
const verifyBox = document.querySelector(".vidElem");
const buttonBox = document.querySelector(".vid-btn");
const start = document.querySelector(".start-scan");
const stop = document.querySelector(".stop-scan");
const overlayText = document.querySelector(".overlay-text");
let result = "";

ready(async () => {
  const isAuth = await runAuthFlow();

  if (!isAuth) return;

  const user = JSON.parse(localStorage.getItem("user"));

  if (user.role === "voter") {
    const userInfo = document.querySelector(".user-info");
    userInfo.innerHTML = `Session with: ${user.name}`;
    try {
      await getElectionVoter();
    } catch (error) {
      message(error.response.data);
      overlayText.innerHTML = `<h3 class="error-message"">${error.response.data} <p>System will log you out in few seconds. Contact Admin.</p></h3>`;
      buttonBox.classList.add("hidden");
      setTimeout(() => {
        localStorage.clear();
        return (window.location.href = "../../login.html");
      }, 4000);
    }
  }
});

async function runAuthFlow() {
  try {
    checkAuth();
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.role) throw new Error("User not authenticated");

    if (user.role === "admin") {
      window.location.href = "../views/dashboard.html";
      return false;
    }

    return true;
  } catch (error) {
    message(error.message);
    overlayText.innerHTML = `<h3 class="error-message"">${error.message} <p>System will log you out in few seconds.</p></h3>`;
    buttonBox.classList.add("hidden");
    setTimeout(() => {
      localStorage.clear();
      return (window.location.href = "../../login.html");
    }, 4000);
    return false;
  }
}

async function getElectionVoter() {
  const response = await axios.get(url, config);
  console.log(response);
}

logOutBtn.addEventListener("click", (event) => {
  event.preventDefault();
  logOut();
});

const qrScanner = new QrScanner(
  verifyBox,
  (result) => {
    console.log(result.data);
    stopScan();
  },
  {
    returnDetailedScanResult: true,
    highlightScanRegion: true,
    calculateScanRegion: (video) => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const size = Math.min(width, height) * 0.45;

      return {
        x: (width - size) / 2,
        y: (height - size) / 2,
        width: size,
        height: size,
      };
    },
  }
);

function startScan() {
  overlayText.classList.add("hidden");
  start.classList.add("hidden");
  stop.classList.remove("hidden");
  qrScanner.start();
}

stop.addEventListener("click", (event) => {
  event.preventDefault();
  stopScan();
});

start.addEventListener("click", (event) => {
  event.preventDefault();
  startScan();
});

function stopScan() {
  overlayText.classList.remove("hidden");
  start.classList.remove("hidden");
  stop.classList.add("hidden");
  setTimeout(() => {
    overlayText.innerHTML = "Please prepare your QR token and press `Start`";
  }, 3000);
  overlayText.innerHTML = "Scanning Process End!";
  qrScanner.stop();
}

function ready(callback) {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) callback();
  });
}
