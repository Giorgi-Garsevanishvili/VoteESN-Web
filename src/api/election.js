import { message } from "../utils/message.js";
import { config, token } from "../handlers/authHandler.js";
import { addExtraInput, electionData } from "../../admin/dashboard.js";

const getElectionUrl = "https://voteesn-api.onrender.com/api/v1/admin/election";
const createElectionUrl =
  "https://voteesn-api.onrender.com/api/v1/admin/election";

const electionList = document.querySelector(".election-list");
const oneElection = document.querySelector(".one-election");
const contOneEl = document.querySelector(".one-el-form");
const addTopic = document.querySelector(".add-topic");
const updateElection = document.querySelector(".update-el");
const deleteElectionBtn = document.querySelector(".delete-el-btn");
const addTopicBtn = document.querySelector(".add-topic");

let responseData = null;

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
  responseData = response.data.data;

  renderOneElectionUpdate(responseData);
  return responseData;
}

export async function createElection() {
  try {
    if (!token) {
      return message("Token is not provided!");
    }
    const response = await axios.post(createElectionUrl, electionData, config);
  } catch (error) {
    message(error.message);
  }
}

async function updateElectionFunction(id, title) {
  const updatedTitle = title;

  const updateTopics = [];

  const topicTitle = document.querySelectorAll(".topic-title");
  const optionsGroup = document.querySelectorAll(".options");
  const extraOptions = document.querySelectorAll(".extra-options-update");

  topicTitle.forEach((topicTitleInput, index) => {
    const optionInputs = optionsGroup[index].querySelectorAll(".topic-option");
    const extraOptionInput =
      extraOptions[index].querySelectorAll(".option-input");

    const options = [];
    optionInputs.forEach((optionInputs) => {
      options.push({ text: optionInputs.value });
    });

    extraOptionInput.forEach((extraOptionInput) => {
      options.push({ text: extraOptionInput.value });
    });

    updateTopics.push({
      title: topicTitleInput.value,
      options: options,
    });
  });

  const updatedData = { title: updatedTitle, topics: updateTopics };

  if (updatedData.topics.some((topic) => topic.title === "")) {
    return message("Topic title is missing");
  }

  if (updatedData.topics.some((topic) => topic.options.length < 2)) {
    return message("Each topic must have at least 2 option");
  }

  if (
    updatedData.topics.some((topic) =>
      topic.options.some((option) => option.text === "")
    )
  ) {
    return message("Please fill or remove empty fields");
  }

  if (updatedData.topics.length < 1) {
    return message("Election is empty you can`t update!");
  }

  try {
    await axios.patch(
      `https://voteesn-api.onrender.com/api/v1/admin/election/${id}`,
      updatedData,
      config
    );

    addTopicBtn.disabled = true;
    deleteElectionBtn.disabled = true;
    updateElection.disabled = true;
    setTimeout(() => {
      addTopicBtn.disabled = false;
      deleteElectionBtn.disabled = false;
      updateElection.disabled = false;
      location.reload();
    }, 2000);

    message("Election Successfully Updated!", "OK", 3000);
  } catch (error) {
    message(error.message);
    console.log(error);
  }
}

async function deleteElection(id) {
  await axios.delete(
    `https://voteesn-api.onrender.com/api/v1/admin/election/${id}`,
    config
  );
}

function removeButtons(option, title) {
  title.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.target.closest(".one-topic").remove();
    });
  });

  option.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();

      event.target.closest(".option-update-box").remove();
    });
  });
}

function addTopicFunction() {
  addTopic.addEventListener("click", (event) => {
    event.preventDefault();

    let html = `<div class="one-topic">
    <h3 class="topic show">Topic</h3>
    <div class="option-update-box">
    <input type="text" placeholder="Add Topic" class="topic-title">
    <button class="remove-title extra-title" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.png" alt="remove option"></button>
    </div>
    <div class="options show">
    <h4>Options:</h4>
    <div class="option-update-box">
        <input type="text" placeholder="Add Option" class="topic-option show">
        <button class="remove-option extra-option" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.png" alt="remove option"></button>
        </div>
        <div class="option-update-box">
        <input type="text" placeholder="Add Option" class="topic-option show">
        <button class="remove-option extra-option" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.png" alt="remove option"></button>
      </div>
      </div>
      <div class="extra-options-update extOptUpdNew"></div>
      <button class="add-option-btn-update addOptUpdNew show">
      <img
      class="add-option-img"
      src="../../img/admin/dashboard/square-plus.png"
      alt="add option"
      />Add Option
          </button>
          </div>
          `;

    contOneEl.insertAdjacentHTML("beforeend", html);

    const titleBTN = document.querySelectorAll(".extra-title");
    const optionBTN = document.querySelectorAll(".extra-option");
    const extraOptionUpdate = document.querySelectorAll(".extOptUpdNew");
    const addOptionBtnUpdate = document.querySelectorAll(".addOptUpdNew");

    addOption(extraOptionUpdate, addOptionBtnUpdate);

    removeButtons(optionBTN, titleBTN);
  });
}

function renderOneElectionUpdate(response) {
  oneElection.classList.remove("hidden");
  oneElection.classList.add("show");

  let topicsHTML = "";

  response.topics.forEach((topic) => {
    let optionHTML = "";

    topic.options.forEach((option) => {
      optionHTML += `
      <div class="option-update-box">
      <input type="text" value="${option.text}" class="topic-option show">
      <button class="remove-option regular-option" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.png" alt="remove option"></button>
      </div>
      `;
    });

    topicsHTML += `<div class="one-topic">
    <h3 class="topic show">Topic</h3>
    <div class="option-update-box">
    <input type="text" value="${topic.title}" class="topic-title">
    <button class="remove-title regular-title" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.png" alt="remove option"></button>
    </div>
    <div class="options show">
      <h4>Options:</h4>
      ${optionHTML}
      </div>
    <div class="extra-options-update extOptUpd"></div>
    <button class="add-option-btn-update addOptUpd show">
    <img
                class="add-option-img"
                src="../../img/admin/dashboard/square-plus.png"
                alt="add option"
                />Add Option
                </button>
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
    <h3>${response.title}</h3>
    <h5>ID: ${response._id}</h5>
    <div class="topic show">
    ${topicsHTML}</div>
    `;

    contOneEl.innerHTML = "";
    contOneEl.insertAdjacentHTML("afterbegin", html);
    const titleBTN = document.querySelectorAll(".regular-title");
    const optionBTN = document.querySelectorAll(".regular-option");
    const extraOptionUpdate = document.querySelectorAll(".extOptUpd");
    const addOptionBtnUpdate = document.querySelectorAll(".addOptUpd");
    removeButtons(optionBTN, titleBTN);
    addOption(extraOptionUpdate, addOptionBtnUpdate);
    addListeners();
  });
}

function updateElectionListener() {
  updateElection.addEventListener("click", (event) => {
    event.preventDefault();

    message(
      `Would you like to update the election? <div class="close-agree"><button class="yes-btn">Yes</button><button class="no-btn">No</button></div>`,
      "OK",
      30000
    );

    const yesBtn = document.querySelector(".yes-btn");
    const noBtn = document.querySelector(".no-btn");

    yesBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        await updateElectionFunction(responseData._id, responseData.title);
      } catch (error) {
        message(error.message);
      }
    });

    noBtn.addEventListener("click", (event) => {
      event.preventDefault();
      message("Update Request Rejected! Continue Update", "error", 3000);
    });
  });
}

function deleteElectionListener() {
  deleteElectionBtn.addEventListener("click", (event) => {
    event.preventDefault();

    message(
      `Would you like to delete the election? <div class="close-agree"><button class="yes-btn">Yes</button><button class="no-btn">No</button></div>`,
      "OK",
      30000
    );

    const yesBtn = document.querySelector(".yes-btn");
    const noBtn = document.querySelector(".no-btn");

    yesBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        await deleteElection(responseData._id);
        message("Election Successfully Deleted!", "OK", 3000);
        updateElection.disabled = true;
        deleteElectionBtn.disabled = true;
        setTimeout(() => {
          updateElection.disabled = false;
          deleteElectionBtn.disabled = false;
          location.reload();
        }, 2000);
      } catch (error) {
        message(error.message);
      }
    });

    noBtn.addEventListener("click", (event) => {
      event.preventDefault();
      message("Delete Request Rejected! Continue Update", "error", 3000);
    });
  });
}

function closeBTN() {
  const closeBtn = document.querySelector(".close-btn-one-el");
  closeBtn.addEventListener("click", (event) => {
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

function addOption(extOpt, addOpt) {
  addOpt.forEach((btn, index) => {
    const relatedBox = extOpt[index];
    addExtraInput(btn, relatedBox);
  });
}

function addListeners() {
  updateElectionListener();
  deleteElectionListener();
  closeBTN();
}

addTopicFunction();
