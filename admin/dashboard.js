import { message } from "../src/utils/message.js";
import { logOut } from "../auth/logout.js";
import { createElection, getElection } from "../src/api/election.js";
import { checkAuth } from "../src/handlers/authHandler.js";

const logOutBtn = document.querySelector(".log-out");
const addElectionBtn = document.querySelector(".add-election-btn");
const addElection = document.querySelector(".add-election");
const closeBtn = document.querySelector(".close-btn");
const extraOption = document.querySelector(".extra-options");
const addOptionBtn = document.querySelector(".add-option-btn");
const electionNameInput = document.querySelector(".election-name-input");
const electionName = document.querySelector(".election-name");
const topicInput = document.querySelector(".topic-input");
const nextBtn = document.querySelector(".next-btn");
const submitElectionBtn = document.querySelector(".submit-btn");

let electionData = {
  title: "",
  topics: [],
};

nextBtn.addEventListener("click", (event) => {
  event.preventDefault();
  message(
    `After this step you want be able to make changes on current topics. If everything is correct press "Yes" button and continue.?<div class="close-agree"><button class="yes-btn">Yes</button><button class="no-btn">No</button></div>`,
    "OK",
    30000
  );

  const yesBtn = document.querySelector(".yes-btn");
  const noBtn = document.querySelector(".no-btn");

  yesBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    const title = electionNameInput.value.trim();

    if (title === "") {
      return message("Please add election name");
    }

    electionData.title = title;

    let topicValue = topicInput.value.trim();

    const optionInputs = document.querySelectorAll(".option-input");
    let options = [];

    optionInputs.forEach((input) => {
      const text = input.value.trim();

      if (text !== "") {
        options.push({ text });
      }

      if (
        options.length >= 2 &&
        topicInput.value !== "" &&
        electionData.title !== ""
      ) {
        electionName.classList.remove("show");
        electionName.classList.add("hidden");
        submitElectionBtn.classList.remove("hidden");
        submitElectionBtn.classList.add("show");

        if (options.length < 2) {
          return message("At least 2 options is required");
        } else {
          topicInput.value = "";
          optionInputs.forEach((input) => {
            input.value = "";
          });
          extraOption.innerHTML = "";
          electionData.topics.push({ title: topicValue, options: options });
          console.log(electionData);
        }
      } else {
        return message("Topic or at least 2 option is missing!");
      }
      message("Add New topic or Save Election", "OK", 3000);
    });
  });

  noBtn.addEventListener("click", (event) => {
    event.preventDefault();
    message("Next Step rejected, continue editing!", "error", 2000);
  });
});

submitElectionBtn.addEventListener("click", (event) => {
  event.preventDefault();
  message(
    `Are you sure to submit Election? <div class="close-agree"><button class="yes-btn">Yes</button><button class="no-btn">No</button></div>`,
    "OK",
    30000
  );

  const yesBtn = document.querySelector(".yes-btn");
  const noBtn = document.querySelector(".no-btn");

  yesBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    await createElection();
    message("Election Created Successfully!", "OK");
    submitElectionBtn.disabled = true;
    setTimeout(() => {
      submitElectionBtn.disabled = false;
      location.reload();
    }, 3000);
  });

  noBtn.addEventListener("click", (event) => {
    event.preventDefault();
    message("Submition rejected, continue editing!", "error", 2000);
  });
});

logOutBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  await logOut();
});

addElectionBtn.addEventListener("click", (event) => {
  event.preventDefault();
  electionName.classList.add("show");
  addElection.classList.remove("hidden");
  addElection.classList.add("show");
});

closeBtn.addEventListener("click", (event) => {
  event.preventDefault();
  message(
    `After close, all information will be deleted! Would you like to close? <div class="close-agree"><button class="yes-btn">Yes</button><button class="no-btn">No</button></div>`,
    "OK",
    30000
  );

  const yesBtn = document.querySelector(".yes-btn");
  const noBtn = document.querySelector(".no-btn");

  yesBtn.addEventListener("click", (event) => {
    event.preventDefault();
    addElection.classList.remove("show");
    addElection.classList.add("hidden");

    electionNameInput.value = "";
    const optionInputs = document.querySelectorAll(".option-input");
    topicInput.value = "";
    optionInputs.forEach((input) => {
      input.value = "";
    });
    electionName.classList.remove("show");
    extraOption.innerHTML = "";
    electionData = {
      title: "",
      topics: [],
    };
    message("Close Request Accepted!", "OK", 1000);
  });

  noBtn.addEventListener("click", (event) => {
    event.preventDefault();
    message("Close Request Rejected!", "Error", 1000);
  });
});

let inputCount = 2;
addOptionBtn.addEventListener("click", (event) => {
  event.preventDefault();

  let html = `
  <div class='extra-input'>
  <input class="option-input-${
    inputCount + 1
  } option-input" type="text" name="topic" placeholder="Add Option">
  <button class="remove-option" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.png" alt="remove option"></button>
  </div>
  `;

  inputCount = inputCount + 1;
  extraOption.insertAdjacentHTML("beforeend", html);
  const removeOptionBtn = document.querySelectorAll(".remove-option");
  removeOptionBtn.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.target.closest(".extra-input").remove();
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  try {
    checkAuth();
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
