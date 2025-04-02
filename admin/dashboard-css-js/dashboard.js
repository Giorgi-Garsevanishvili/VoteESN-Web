import { message } from "../../utils/message.js";

const getElectionUrl = "https://voteesn-api.onrender.com/api/v1/admin/election";
const electionList = document.querySelector(".election-list");
const logOutBtn = document.querySelector(".log-out");
const addElectionBtn = document.querySelector(".add-election-btn");
const addElection = document.querySelector(".add-election");
const closeBtn = document.querySelector(".close-btn");
const addOption = document.querySelector(".options");
const addOptionBtn = document.querySelector(".add-option-btn");


logOutBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  await logOut();
});

function logOut() {
  localStorage.clear();
  window.location.href = "../../login.html";
}

async function getElection() {
  try {
    electionList.innerHTML = `Loading...`;
    const token = localStorage.getItem("authToken");

    if (!token) {
      electionList.innerHTML = "Token is not provided!";
    }

    const election = await axios.get(getElectionUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const response = election.data;
    const electionData = response.data;
    const allElections = electionData.allElections;

    if (allElections.length >= 1) {
      electionList.innerHTML = "";
    } else if (allElections.length < 1) {
      electionList.innerHTML = "No elections to display";
    }

    allElections.forEach((election) => {
      let html = `<button class="election-btn">
    <img class="election-img" src="../../img/admin/dashboard/ballot.png" alt="election">
    <h4>${election.title}</h4>
    <h5>${election._id}</h5>
    </button>`;
      electionList.innerHTML += html;
    });
  } catch (error) {
    electionList.innerHTML = error.message;
    message(error.message);
    localStorage.clear();
    return (window.location.href = "../../login.html");
  }
}

async function createElection(params) {
  const data = [
    {
      title: title,
      topics: [
        {
          title: title,
          options: [{ text: text }, { text: text }],
        },
      ],
    },
  ];
}

addElectionBtn.addEventListener("click", (event) => {
  event.preventDefault();
  addElection.classList.remove("hidden");
  addElection.classList.add("show");
});

closeBtn.addEventListener("click", (event) => {
  event.preventDefault();
  addElection.classList.remove("show");
  addElection.classList.add("hidden");
});

let inputCount = 2;
addOptionBtn.addEventListener("click", (event) => {
  event.preventDefault();

  let html = `
  <div class="extra-options">
  <input class="option-input-${
    inputCount + 1
  }" type="text" name="topic" placeholder="Add Option">
  <button class="remove-option"><img class="remove-option-img" src="../img/admin/dashboard/circle-xmark.png" alt="remove option"></button>
  </div>
  `;

  
  inputCount = inputCount + 1;
  addOption.innerHTML += html;
});


document.addEventListener("DOMContentLoaded", () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      localStorage.setItem("error", "Token is not proveded!");
      return (window.location.href = "../../login.html");
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const userInfo = document.querySelector(".user-info");

    userInfo.innerHTML = `Session with admin: ${user.name}`;

    getElection();
  } catch (error) {
    message(error.message);
    setTimeout(() => {
      localStorage.clear();
      return (window.location.href = "../../login.html");
    }, 5000);
  }
});
