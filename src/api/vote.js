import QrScanner from "../../lib/qr-scanner.min.js";
import { logOut } from "../../auth/logout.js";
import { checkAuth, getAuthConfig } from "../handlers/authHandler.js";
import { message } from "../utils/message.js";

const url = `https://voteesn-api.onrender.com/api/v1/user/voter`;

const tokenInput = document.querySelector(".tok-manual");
const manualTokInput = document.querySelector(".manual-tok-inp");
const submitTok = document.querySelector(".enter-tok");
const noQrBtn = document.querySelector(".no-qr-btn");
const voteMainBox = document.querySelector(".vote-box");
const scanningBox = document.querySelector(".verify-box");
const logOutBtn = document.querySelector(".log-out");
const verifyBox = document.querySelector(".vidElem");
const buttonBox = document.querySelector(".vid-btn");
const start = document.querySelector(".start-scan");
const stop = document.querySelector(".stop-scan");
const overlayText = document.querySelector(".overlay-text");
const lastLogin = document.querySelector(".last-login");
let result = "";

async function getElAuth() {
  try {
    const { config } = getAuthConfig();
    await axios.get(url, config);
  } catch (error) {
    throw new Error("Authentication faild!");
  }
}

setInterval(async () => {
  try {
    await getElAuth();
  } catch (error) {
    setTimeout(() => {
      window.location.href = "../../login.html";
    }, 2000);
    message(error.message);
    localStorage.clear();
    return message("Authentication Faild!");
  }
}, 5000);

submitTok.addEventListener("click", async (event) => {
  event.preventDefault();
  const token = manualTokInput.value;
  await tokenValidation(token);
  manualTokInput.value = "";
});

noQrBtn.addEventListener("click", (event) => {
  event.preventDefault();

  start.classList.remove("hidden");
  start.classList.add("show");
  stop.classList.add("hidden");
  scanningBox.classList.remove("show");
  scanningBox.classList.add("hidden");
  overlayText.classList.add("hidden");
  tokenInput.classList.remove("hidden");
  tokenInput.classList.add("show");
  noQrBtn.classList.add("hidden");
  noQrBtn.classList.remove("show");
});

ready(async () => {
  const isAuth = await runAuthFlow();

  if (!isAuth) return;

  const user = JSON.parse(localStorage.getItem("user"));

  const lastLoginTime = new Date(user.lastLogin);

  lastLogin.innerHTML = `Last login to the system: ${lastLoginTime
    .toISOString()
    .substring(0, 16)
    .replace("T", " ")}`;

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

async function tokenValidation(token) {
  const data = {
    token,
  };
  const valUrl = `https://voteesn-api.onrender.com/api/v1/user/tokenvalidation`;
  try {
    const { config } = getAuthConfig();
    const response = await axios.post(valUrl, data, config);
    localStorage.setItem("electionID", response.data.data[0].electionId);
    localStorage.setItem("voterToken", response.data.data[0].token);
    tokenInput.classList.remove("show");
    tokenInput.classList.add("hidden");
    buttonBox.classList.remove("show");
    buttonBox.classList.add("hidden");
    message("Valid Token Presented!", "OK", 2000);
    await getOneElection();
  } catch (error) {
    localStorage.removeItem("voterToken");
    localStorage.removeItem("electionID");
    message(error.response.data.message);
  }
}

async function getOneElection() {
  const electionID = localStorage.getItem("electionID");
  const uniqueToken = localStorage.getItem("voterToken");
  const oneElUrl = `https://voteesn-api.onrender.com/api/v1/user/voter/${electionID}?token=${uniqueToken}`;
  try {
    const { config } = getAuthConfig();
    let electionData = {
      title: "",
      topics: [],
    };

    let answers = [];
    const election = await axios.get(oneElUrl, config);
    electionData.title = election.data.data.title;
    electionData.topics.push(election.data.data.topics);

    verifyBox.classList.add("hidden");
    overlayText.classList.add("hidden");
    buttonBox.classList.add("hidden");
    scanningBox.classList.remove("show");
    scanningBox.classList.add("hidden");
    voteMainBox.classList.remove("hidden");
    voteMainBox.classList.add("show");

    const voteBox = document.querySelector(".vote-submit-box");

    voteBox.innerHTML = `
        <h1 class="terms">📜 Terms and Conditions</h1>
        <h5 class="terms">By participating in this election, you agree to the following:</h5>
          <ul>
            <li>Only registered users may vote.</li>
            <li>Each person can vote only once per question.</li>
            <li>Votes are confidential and final.</li>
            <li>Attempts to manipulate results may lead to disqualification.</li>
            <li>Make sure to submit before the deadline.</li>
          </ul>
        <button class="agree">Agree. Lets Start</button>
    `;

    const currentElection = document.querySelector("#current-el");
    const agreeBtn = document.querySelector(".agree");
    currentElection.innerHTML = electionData.title;

    agreeBtn.addEventListener("click", (event) => {
      renderOneQuestion();
    });

    function renderOneQuestion() {
      let optionsHtml = "";

      if (electionData.topics[0].length === 0) {
        voteBox.innerHTML = `
        <h5 class="thanks-message">Thanks for your participation. Just one last step – submit your vote!</h5>
        <button class="submit-el-btn">Submit Answers!</buttom>`;

        const submitElection = document.querySelector(".submit-el-btn");
        submitElection.addEventListener("click", (event) => {
          event.preventDefault();
          const submitElURL = `https://voteesn-api.onrender.com/api/v1/user/voter/${electionID}?token=${uniqueToken}`;

          try {
            const { config } = getAuthConfig();
            axios.post(submitElURL, answers, config);

            message("Your answers Submited!", "OK", 3000);
            setTimeout(() => {
              localStorage.removeItem("voterToken");
              localStorage.removeItem("electionID");
              location.reload();
            }, 2000);
          } catch (error) {
            console.log(error);
          }
        });

        return;
      }

      const topics = electionData.topics[0][0];

      topics.options.forEach((option, index) => {
        const id = `option-${index}`;
        optionsHtml += `
          <label for="${id}">
            <input type="radio" id="${id}" name="topic-${topics._id}" value="${option.text}">  
            <span>${option.text}</span>
          </label>
      `;
      });

      let oneQuestionHtml = `
        <div class="question-box">
          <h3>${electionData.topics[0][0].title}</h3>
          <div class="radio-wrapper-19">${optionsHtml}</div>
        </div>
      <button class="next-topic">Next Topic</button>
    `;

      voteBox.innerHTML = oneQuestionHtml;

      const nextTopicBtn = document.querySelector(".next-topic");
      nextTopicBtn.addEventListener("click", (event) => {
        event.preventDefault();

        const selectedInput = document.querySelector(
          `input[name="topic-${topics._id}"]:checked`
        );

        if (!selectedInput) {
          alert("Please select an option before continuing.");
          return;
        }

        answers.push({
          question: electionData.topics[0][0].title,
          selectedOption: selectedInput.value,
        });

        electionData.topics[0].shift();

        renderOneQuestion();
      });
    }
  } catch (error) {
    console.log(error);
  }
}

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
  const { config } = getAuthConfig();
  await axios.get(url, config);
}

logOutBtn.addEventListener("click", (event) => {
  event.preventDefault();
  logOut();
});

const qrScanner = new QrScanner(
  verifyBox,
  async (result) => {
    stopScan();
    await tokenValidation(result.data);
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
  start.classList.remove("show");
  start.classList.add("hidden");
  scanningBox.classList.add("show");
  stop.classList.remove("hidden");
  tokenInput.classList.remove("show");
  tokenInput.classList.add("hidden");
  noQrBtn.classList.add("show");
  noQrBtn.classList.remove("hidden");
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
