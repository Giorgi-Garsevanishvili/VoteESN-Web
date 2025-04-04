import { message } from "../utils/message.js";
import { config, token } from "../handlers/authHandler.js";

const getElectionUrl = "https://voteesn-api.onrender.com/api/v1/admin/election";
const createElectionUrl ="https://voteesn-api.onrender.com/api/v1/admin/election";

const electionList = document.querySelector(".election-list");
const oneElection = document.querySelector(".one-election");
const contOneEl = document.querySelector(".cont-one-el");

export async function getElection() {
  try {
    electionList.innerHTML = `Loading...`;
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
    <h4 class="el-name">${election.title}</h4>
    <h5 class="el-id">${election._id}</h5>
    </button>`;
      electionList.insertAdjacentHTML("afterbegin", html);
    });

    const elBtn = document.querySelectorAll(".election-btn");
    elBtn.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const id = event.currentTarget.querySelector(".el-id").innerHTML;
        getOneElection(id);
      });
    });
  } catch (error) {
    electionList.innerHTML = error.message;
    message(error.message);
    localStorage.clear();
    return (window.location.href = "../../login.html");
  }
}

export async function getOneElection(id) {
  const response = await axios.get(
    `https://voteesn-api.onrender.com/api/v1/admin/election/${id}`,
    config
  );
  const responseData = response.data.data;

  oneElection.classList.remove("hidden");
  oneElection.classList.add("show");

  let topicsHTML = "";

  responseData.topics.forEach((topic) => {
    let optionHTML = "";

    topic.options.forEach((option) => {
      optionHTML += `
        <input type="text" value="${option.text}" class="topic-option show">
      `;
    });

    topicsHTML += `
    <h3 class="topic show">Topic</h3>
    <input type="text" value="${topic.title}" class="topic-title">
    <div class="options show">
      <h4>Options:</h4>
      ${optionHTML}
    </div>
  `;

    let html = `
        <button class="close-btn-one-el">
          <img
            class="close-img-one-el"
            src="../../img/admin/dashboard/circle-xmark.png"
            alt="close"
          />
        </button>
        <h3>${responseData.title}</h3>
        <h5>ID: ${responseData._id}</h5>
        <div class="TopicsBox">
        ${topicsHTML}</div>
  `;

    contOneEl.innerHTML = "";
    contOneEl.insertAdjacentHTML("afterbegin", html);
  });

  const closeBtnOneEl = document.querySelector(".close-btn-one-el");
  closeBtnOneEl.addEventListener("click", (event) => {
    event.preventDefault();
    message(
      `Any updates will be lost after close! would you like to close? <div class="close-agree"><button class="yes-btn">Yes</button><button class="no-btn">No</button></div>`,
      "OK",
      30000
    );

    const yesBtn = document.querySelector(".yes-btn");
    const noBtn = document.querySelector(".no-btn");

    yesBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      oneElection.classList.remove("show");
      oneElection.classList.add("hidden");
      message("Individual Election Page closed!", "OK", 2000);
    });

    noBtn.addEventListener("click", (event) => {
      event.preventDefault();
      message("Tab closing rejected, continue editing!", "error", 2000);
    });
  });
}

export async function createElection(params) {
  try {
    if (!token) {
      return message("Token is not provided!");
    }
    const response = await axios.post(createElectionUrl, electionData, config);
    console.log(response.data);
  } catch (error) {
    message(error.response.data.message);
  }
}
