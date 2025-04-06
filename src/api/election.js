import { message } from "../utils/message.js";
import { config, token } from "../handlers/authHandler.js";
import { electionData } from "../../admin/dashboard.js";

const getElectionUrl = "https://voteesn-api.onrender.com/api/v1/admin/election";
const createElectionUrl =
  "https://voteesn-api.onrender.com/api/v1/admin/election";

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
      <div class="option-update-box">
        <input type="text" value="${option.text}" class="topic-option show">
        <button class="remove-option" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.png" alt="remove option"></button>
        </div>
      `;
    });

    topicsHTML += `<div class="one-topic">
    <h3 class="topic show">Topic</h3>
      <div class="option-update-box">
      <input type="text" value="${topic.title}" class="topic-title">
      <button class="remove-title" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.png" alt="remove option"></button>
    </div>
    <div class="options show">
      <h4>Options:</h4>
      ${optionHTML}
    </div>
    <div class="extra-options"></div>
    <button class="add-option-btn show">
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
        <h3>${responseData.title}</h3>
        <h5>ID: ${responseData._id}</h5>
        <div class="topic show">
        ${topicsHTML}</div>
        <div class="one-el-btns">
          <button class="delete-el-btn">Delete Election</button>
          <button class="update-el">Update Election</buttom>
        </div>
  `;

    contOneEl.innerHTML = "";
    contOneEl.insertAdjacentHTML("afterbegin", html);

    const removeTitleBTN = document.querySelectorAll(".remove-title");
    removeTitleBTN.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.target.closest(".one-topic").remove();
      });
    });

    const removeOptionBTN = document.querySelectorAll(".remove-option");
    removeOptionBTN.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();

        event.target.closest(".option-update-box").remove();
      });
    });
  });

  const updateElection = document.querySelector(".update-el");
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
        deleteElectionBtn.disabled = true;
        updateElection.disabled = true;
        setTimeout(() => {
          deleteElectionBtn.disabled = false;
          updateElection.disabled = false;
          location.reload();
        }, 2000);
      } catch (error) {
        message(error.message);
      }
    });

    noBtn.addEventListener("click", (event) => {
      event.preventDefault();
      message("Update Request Rejected! Continue Update", "error", 3000);
    });
  });

  const deleteElectionBtn = document.querySelector(".delete-el-btn");
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

  return responseData
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

  topicTitle.forEach((topicTitleInput, index) => {
    const optionInputs = optionsGroup[index].querySelectorAll(".topic-option");

    const options = [];
    optionInputs.forEach((optionInputs) => {
      options.push({ text: optionInputs.value });
    });

    updateTopics.push({
      title: topicTitleInput.value,
      options: options,
    });
  });

  const updatedData = { title: updatedTitle, topics: updateTopics };

  if (updatedData.topics.length < 1){
    try {
      await deleteElection(id)
     return message('Election is empty, Successfully Deleted! ')
    } catch (error) {
      message(error.message)
    }
  }

  try {
    await axios.patch(
      `https://voteesn-api.onrender.com/api/v1/admin/election/${id}`,
      updatedData,
      config
    );
    message("Election Successfully Updated!", "OK", 3000);
  } catch (error) {
    message(error.message);
  }
}

async function deleteElection(id) {
  await axios.delete(
    `https://voteesn-api.onrender.com/api/v1/admin/election/${id}`,
    config
  );
}
