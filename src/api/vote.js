import QrScanner from "../../node_modules/qr-scanner/qr-scanner.min.js";
import { logOut } from "../../auth/logout.js";
import { checkAuth, config } from "../handlers/authHandler.js";
import { message } from "../utils/message.js";

const url = `https://voteesn-api.onrender.com/api/v1/user/voter`;

const logOutBtn = document.querySelector(".log-out");
const verifyBox = document.querySelector(".vidElem");
const start = document.querySelector(".start-scan");
const stop = document.querySelector(".stop-scan");
const overlayText = document.querySelector(".overlay-text");
let result = "";

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
    calculateScanRegion: (video) => {
      const width = video.videoWidth * 0.5; // 50% of video width
      const height = video.videoHeight * 0.5; // 50% of video height
      const x = (video.videoWidth - width) / 2;
      const y = (video.videoHeight - height) / 2;

      return { x, y, width, height };
    },
    highlightScanRegion: true,
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

document.addEventListener("DOMContentLoaded", async () => {
  try {
    checkAuth();
    const user = JSON.parse(localStorage.getItem("user"));
    if (user.role === "voter") {
      const userInfo = document.querySelector(".user-info");
      userInfo.innerHTML = `Session with: ${user.name}`;
      await getElectionVoter();
    } else if (user.role === "admin") {
      return (window.location.href = "../views/dashboard.html");
    } else {
      return (window.location.href = "../../login.html");
    }
  } catch (error) {
    message(error.message);
    setTimeout(() => {
      localStorage.clear();
      return (window.location.href = "../../login.html");
    }, 5000);
  }
});
