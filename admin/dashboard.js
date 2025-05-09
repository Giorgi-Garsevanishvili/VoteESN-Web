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
const addedInfo = document.querySelector(".added-info");

const lastLogin = document.querySelector(".last-login");

// let devtoolsOpen = false;

// function detectDevTools() {
//   const threshold = 160;
//   const widthThreshold = window.outerWidth - window.innerWidth > threshold;
//   const heightThreshold = window.outerHeight - window.innerHeight > threshold;

//   if (widthThreshold || heightThreshold) {
//     devtoolsOpen = true;
//     alert('DevTools detected! Reveal blocked.');
//     // Optionally you can log the devtools access to your server
//     // fetch('/log-devtools', {
//     //   method: 'POST',
//     //   headers: { 'Content-Type': 'application/json' },
//     //   body: JSON.stringify({
//     //     message: 'DevTools was opened on page',
//     //     timestamp: new Date().toISOString()
//     //   })
//     // });
//   } else {
//     devtoolsOpen = false;
//   }
// }

// setInterval(detectDevTools, 500); // Every 0.5 seconds, check

// document.addEventListener('keydown', (e) => {
//   if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
//     e.preventDefault();
//     message('DevTools is disabled! For security purposes.', "error", 4000);
//   }
// });

// document.addEventListener('contextmenu', (e) => {
//   e.preventDefault();
//   message('Right-click is disabled! For security purposes.', "error", 4000);
// });

export let electionData = {
  title: "",
  topics: [],
};

ready(async () => {
  const isAuth = await runAuthFlow();

  if (!isAuth) return;

  const user = JSON.parse(localStorage.getItem("user"));

  const lastLoginTime = new Date(user.lastLogin);

  lastLogin.innerHTML = `Last login to the system: ${lastLoginTime
    .toISOString()
    .substring(0, 16)
    .replace("T", " ")}`;

  if (user.role === "admin") {
    const userInfo = document.querySelector(".user-info");
    if (userInfo) {
      userInfo.innerHTML = `Session with admin: ${user.name}.  Section: ${user.section}`;
    }
    await getElection();
  }
});

async function runAuthFlow() {
  try {
    checkAuth();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.role) throw new Error("User not authenticated");

    if (user.role === "voter") {
      window.location.href = "../views/vote.html";
      return false;
    }

    return true;
  } catch (error) {
    message(error.message);
    setTimeout(() => {
      localStorage.clear();
      return (window.location.href = "../../login.html");
    }, 1000);
    return false;
  }
}

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
    });

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
        electionData.topics.push({ title: topicValue, options });

        addedInfo.innerHTML = `🗳️ Election Name and ${electionData.topics.length} topic added`;
      }
    } else if (electionData.topics.length >= 1) {
      message("Add New topic or Save Election", "OK", 3000);
    } else {
      return message("Topic or at least 2 option is missing!");
    }
    message("Add New topic or Save Election", "OK", 3000);
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
    try {
      await createElection();
      submitElectionBtn.disabled = true;
      message("Election Created Successfully!", "OK", 3000);
      setTimeout(() => {
        submitElectionBtn.disabled = false;
        location.reload();
      }, 2000);
    } catch (error) {
      message(error);
    }
  });

  noBtn.addEventListener("click", (event) => {
    event.preventDefault();
    message("Submition rejected, continue editing!", "error", 2000);
  });
});

logOutBtn.addEventListener("click", (event) => {
  event.preventDefault();
  logOut();
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
    submitElectionBtn.classList.remove("show");
    submitElectionBtn.classList.add("hidden");
    electionName.classList.remove("show");
    extraOption.innerHTML = "";
    addedInfo.innerHTML = "Elections Form Is Clear";

    if (electionData.title !== "") {
      electionData = {
        title: "",
        topics: [],
      };
    }

    message("Close Request Accepted!", "OK", 1000);
  });

  noBtn.addEventListener("click", (event) => {
    event.preventDefault();
    message("Close Request Rejected!", "Error", 1000);
  });
});

addExtraInput(addOptionBtn, extraOption);

export function addExtraInput(target, box) {
  let inputCount = 2;
  target.addEventListener("click", (event) => {
    event.preventDefault();

    let html = `
    <div class='extra-input'>
    <input class="option-input-${
      inputCount + 1
    } option-input" type="text" name="topic" placeholder="Add Option">
    <button class="remove-option" data><img class="remove-option-img" src="../../img/admin/dashboard/circle-xmark.webp" alt="remove option"></button>
    </div>
    `;

    inputCount = inputCount + 1;
    box.insertAdjacentHTML("beforeend", html);
    const removeOptionBtn = document.querySelectorAll(".remove-option");
    removeOptionBtn.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.target.closest(".extra-input").remove();
      });
    });
  });
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
