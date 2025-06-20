// Description : This module prociedes functions to manage elections, including fetching, creating, updating, and deleting elections, as well as handling election topics and options.

import { message } from "../utils/message.js";
import { getAuthConfig } from "../handlers/authHandler.js";
import { addExtraInput, electionData } from "../../admin/dashboard.js";
import { deleteQrcodes } from "./tokens-manager.js";
import { deleteResult } from "./results.js";

// API endpoints for election management
const ElectionUrl = "https://voteesn-api.onrender.com/api/v1/admin/election";

// DOM elements for election management
const toolContainer = document.querySelector(".tool-cont");
const oneElection = document.querySelector(".one-election");
const contOneEl = document.querySelector(".one-el-form");
const addTopic = document.querySelector(".add-topic");
const updateElection = document.querySelector(".update-el");
const deleteElectionBtn = document.querySelector(".delete-el-btn");
const addTopicBtn = document.querySelector(".add-topic");
const homeBtn = document.querySelector(".election-home-btn");

// Tool title and other UI elements
const toolTitle = document.querySelector(".tool-name");
const generated = document.querySelector(".generated");
const tokCountBox = document.querySelector(".tok-count-box");
const resultBox = document.querySelector(".el-res");

// Navigation buttons for election management
const genQRBtn = document.querySelector(".gen-qr-btn");
const getQRBtn = document.querySelector(".get-qr-btn");
const getResBtn = document.querySelector(".get-res-btn");

// Variable to store the response data from election requests
let responseData = null;

// Function to get authentication for election management
async function getElAuth() {
  try {
    const { config } = getAuthConfig();
    await axios.get(ElectionUrl, config);
  } catch (error) {
    throw new Error("Authentication faild!");
  }
}
// Set an interval to check authentication every 5 seconds
setInterval(async () => {
  try {
    await getElAuth();
  } catch (error) {
    setTimeout(() => {
      window.location.href = "../../login.html";
    }, 2000);
    toolContainer.innerHTML = error.message;
    message(error.message);
    localStorage.clear();
    return message("Authentication Faild!");
  }
}, 5000);

// Function to get all elections from the server
export async function getAllElection(elections) {
  const { config } = getAuthConfig();
  elections = await axios.get(ElectionUrl, config);
  return elections;
}

// function to get and display all elections view buttons
export async function getElection() {
  try {
    const { config } = getAuthConfig();
    toolContainer.innerHTML = `Loading...`;

    const election = await axios.get(ElectionUrl, config);
    const response = election.data;
    const electionData = response.data;
    const allElections = electionData.allElections;

    if (allElections.length >= 1) {
      toolContainer.innerHTML = "";
    } else if (allElections.length < 1) {
      toolContainer.innerHTML = "No elections to display";
    }

    allElections.forEach((election) => {
      let html = `<button class="election-btn ${
        election.status === "Ongoing"
          ? "inProgress"
          : election.status === "Completed"
          ? "done"
          : ""
      }">
      <img class="election-img" src="../../img/admin/dashboard/vote-yea.webp" alt="election">
      <div class="el-btn-info">
        <h3>${
          election.status === "Completed"
            ? "✅"
            : election.status === "Ongoing"
            ? "🔄"
            : "📝"
        }<h3>
        <h5 class="el-name">${election.title}</h5>
        <h5 class="el-id" hidden>${election._id}</h5>
        <h5 class="el-status">Status: ${election.status}</h5>
      </div>
      </button>`;
      toolContainer.insertAdjacentHTML("afterbegin", html);
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
    toolContainer.innerHTML = error.message;
    message(error.message);
    localStorage.clear();
    return (window.location.href = "../../login.html");
  }
}

// Function to get a single election by ID
export async function getOneElection(id) {
  try {
    const { config, token } = getAuthConfig();
    const response = await axios.get(
      `https://voteesn-api.onrender.com/api/v1/admin/election/${id}`,
      config
    );
    responseData = response.data;

    renderOneElectionUpdate(responseData);
    return responseData;
  } catch (error) {
    console.log(error);
  }
}

// Function to create a new election
export async function createElection() {
  try {
    const { config } = getAuthConfig();
    await axios.post(ElectionUrl, electionData, config);
  } catch (error) {
    message(error.message);
  }
}

// Function to update an existing election
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
    const { config } = getAuthConfig();
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
  }
}

// Function to delete an election by ID
async function deleteElection(id) {
  const { config } = getAuthConfig();
  await axios.delete(
    `https://voteesn-api.onrender.com/api/v1/admin/election/${id}`,
    config
  );
}

// Function to remove buttons for topics and options
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

// Function to add a new topic with options
function addTopicFunction() {
  addTopic.addEventListener("click", (event) => {
    event.preventDefault();

    let html = `<div class="one-topic">
    <h3 class="topic show">Topic</h3>
    <div class="option-update-box">
    <input type="text" placeholder="Add Topic" class="topic-title">
    <button class="remove-title extra-title" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.webp" alt="remove option"></button>
    </div>
    <div class="options show">
    <h4>Options:</h4>
    <div class="option-update-box">
        <input type="text" placeholder="Add Option" class="topic-option show">
        <button class="remove-option extra-option" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.webp" alt="remove option"></button>
        </div>
        <div class="option-update-box">
        <input type="text" placeholder="Add Option" class="topic-option show">
        <button class="remove-option extra-option" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.webp" alt="remove option"></button>
      </div>
      </div>
      <div class="extra-options-update extOptUpdNew"></div>
      <button class="add-option-btn-update addOptUpdNew show">
      <img
      class="add-option-img"
      src="../../img/admin/dashboard/square-plus.webp"
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

// Function to render the election update page in detail.
function renderOneElectionUpdate(response) {
  oneElection.classList.remove("hidden");
  oneElection.classList.add("show");

  let topicsHTML = "";

  response.data.topics.forEach((topic) => {
    let optionHTML = "";

    const createdAtDB = new Date(response.data.created_at);
    const updatedAtDB = new Date(response.data.updated_at);

    const createdAt = createdAtDB
      .toISOString()
      .substring(0, 16)
      .replace("T", " ");
    const updatedAt = updatedAtDB
      .toISOString()
      .substring(0, 16)
      .replace("T", " ");

    topic.options.forEach((option) => {
      optionHTML += `
      <div class="option-update-box">
      <input type="text" value="${option.text}" class="topic-option show">
      <button class="remove-option regular-option" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.webp" alt="remove option"></button>
      </div>
      `;
    });

    topicsHTML += `<div class="one-topic">
    <h3 class="topic show">Topic</h3>
    <div class="option-update-box">
    <input type="text" value="${topic.title}" class="topic-title">
    <button class="remove-title regular-title" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.webp" alt="remove option"></button>
    </div>
    <div class="options show">
      <h4>Options:</h4>
      ${optionHTML}
      </div>
    <div class="extra-options-update extOptUpd"></div>
    <button class="add-option-btn-update addOptUpd show">
    <img
                class="add-option-img"
                src="../../img/admin/dashboard/square-plus.webp"
                alt="add option"
                />Add Option
                </button>
            </div>
            `;

    let html = `
    <button class="close-btn-one-el">
    <img
    class="close-img-one-el"
    src="../../img/admin/dashboard/circle-xmark.webp"
    alt="close"
    />
    </button>
    <h3 class="one-el-title">${response.data.title}</h3>
    <br>
    <h5 class="hidden" >ID: ${response.data._id}</h5>
    <h5>Created By: ${response.author}</h5>
    <h5>Created At: ${createdAt}</h5>
    <br>
    <h5>Updated By: ${response.updatedBy}</h5>
    <h5>Updated At: ${updatedAt}</h5> 
    <br>
    <label class="toggle">
      <h5 class="toggle-label">Election Complete</h5>
      <h5 class="toggle-label">${
        response.data.status === "Completed" || response.data.status === "Draft"
          ? "🔒 Locked (Cannot change)"
          : "🟢 Toggle to Complete"
      }</h5>
      <input ${
        response.data.status === "Completed" || response.data.status === "Draft"
          ? "disabled"
          : ""
      } class="toggle-checkbox election-close" type="checkbox" ${
      response.data.status === "Completed" ? "checked" : ""
    }>
      <div class="toggle-switch"></div>

    </label>
      <label class="toggle">
      <h5 class="toggle-label">Election Ongoing</h5>
      <h5 class="toggle-label">${
        response.data.status === "Completed" ||
        response.data.status === "Ongoing"
          ? "🔒 Locked (Cannot change)"
          : "🔄 Toggle to Launch"
      }</h5>
      <input ${
        response.data.status === "Completed" ||
        response.data.status === "Ongoing"
          ? "disabled"
          : ""
      } class="toggle-checkbox election-launch" type="checkbox" ${
      response.data.status === "Ongoing" ? "checked" : ""
    }>
      <div class="toggle-switch"></div>
    </label>
    <div class="warning show
    }"><h4>${
      response.data.status === "Ongoing"
        ? "This election is Ongoing. You can only mark it as Completed."
        : response.data.status === "Completed"
        ? "This election is Completed. You can only delete it or view reports in the dedicated area."
        : "This election is in Draft. Launch it before making it available for voting or completing."
    }</h4></div>
    <br>
    <div class="topic ${
      response.data.status === "Completed" || response.data.status === "Ongoing"
        ? "hidden"
        : "show"
    }">
    ${topicsHTML}</div>
    `;

    if (
      response.data.status === "Completed" ||
      response.data.status === "Ongoing"
    ) {
      updateElection.classList.add("hidden");
      addTopic.classList.add("hidden");
    } else {
      updateElection.classList.remove("hidden");
      addTopic.classList.remove("hidden");
    }

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

// Function to launch the election
function launchElectionListener() {
  const closeToggle = document.querySelector(".election-launch");
  closeToggle.addEventListener("click", (event) => {
    event.preventDefault();

    message(
      `Would you like to Launch the election? <div class="close-agree"><button class="yes-btn">Yes</button><button class="no-btn">No</button></div>`,
      "OK",
      30000
    );

    const yesBtn = document.querySelector(".yes-btn");
    const noBtn = document.querySelector(".no-btn");

    yesBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        await changeElectionStatus(responseData.data._id, "Ongoing");
      } catch (error) {
        message(error.message);
      }
    });

    noBtn.addEventListener("click", (event) => {
      event.preventDefault();
      message("Launch Request Rejected! Continue Update", "error", 3000);
    });
  });
}

// Function to mark election as completed
function closeElectionListener() {
  const closeToggle = document.querySelector(".election-close");
  closeToggle.addEventListener("click", (event) => {
    event.preventDefault();

    message(
      `Would you like to complete the election process? <div class="close-agree"><button class="yes-btn">Yes</button><button class="no-btn">No</button></div>`,
      "OK",
      30000
    );

    const yesBtn = document.querySelector(".yes-btn");
    const noBtn = document.querySelector(".no-btn");

    yesBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        await changeElectionStatus(responseData.data._id, "Completed");
      } catch (error) {
        message(error.message);
      }
    });

    noBtn.addEventListener("click", (event) => {
      event.preventDefault();
      message("Complete Request Rejected! Continue Update", "error", 3000);
    });
  });
}

// function to change the election status to completed or ongoing
async function changeElectionStatus(id, status) {
  let updatedData = {
    status: status,
  };
  try {
    const { config } = getAuthConfig();
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

    message("Election Successfully Closed!", "OK", 3000);
  } catch (error) {
    console.log(error);
  }
}

// Function to update the election listener
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
        await updateElectionFunction(
          responseData.data._id,
          responseData.data.title
        );
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

// Function to delete the election listener
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
        const id = responseData.data._id;
        await deleteResult(id);
        await deleteQrcodes(id);
        await deleteElection(id);
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

// Function to handle the close button functionality
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

// Function to add extra input options for topics
function addOption(extOpt, addOpt) {
  addOpt.forEach((btn, index) => {
    const relatedBox = extOpt[index];
    addExtraInput(btn, relatedBox);
  });
}

// Function to add all listeners for election management
function addListeners() {
  updateElectionListener();
  deleteElectionListener();
  closeElectionListener();
  launchElectionListener();
  closeBTN();
}

// Event listener for the home button to reset the view
homeBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  generated.innerHTML = "";
  toolTitle.innerHTML = "Home";
  toolContainer.innerHTML = "";
  tokCountBox.classList.add("hidden");
  tokCountBox.classList.remove("show");
  resultBox.innerHTML = "";
  homeBtn.classList.add("selected");
  genQRBtn.classList.remove("selected");
  getQRBtn.classList.remove("selected");
  getResBtn.classList.remove("selected");
  await getElection();
  toolContainer.scrollIntoView();
});

addTopicFunction();
