import { message } from "../../utils/message.js";

const getElectionUrl = "https://voteesn-api.onrender.com/api/v1/admin/election";
const createElectionUrl =
  "https://voteesn-api.onrender.com/api/v1/admin/election";

const electionList = document.querySelector(".election-list");
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
        electionName.classList.add("hidden");
        submitElectionBtn.classList.remove("hidden");
        submitElectionBtn.classList.add("show");
        options.push({ text });
      }
      message('Add New topic or Save Election', "OK", 3000)
    });

    if (options.length < 2 && topicValue === "") {
      return message("Topic or at least 2 option is missing!");
    }

    topicInput.value = "";
    optionInputs.forEach((input) => {
      input.value = "";
    });
    extraOption.innerHTML = "";
    electionData.topics.push({ title: topicValue, options: options });
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
  try {
    const token = localStorage.getItem("authToken");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    if (!token) {
      return message("Token is not provided!");
    }
    const response = await axios.post(createElectionUrl, electionData, config);
    console.log(response.data);
  } catch (error) {
    message(error.response.data.message);
  }
}

addElectionBtn.addEventListener("click", (event) => {
  event.preventDefault();
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
    event.preventDefault;
    addElection.classList.remove("show");
    addElection.classList.add("hidden");

    electionNameInput.value = "";
    const optionInputs = document.querySelectorAll(".option-input");
    topicInput.value = "";
    optionInputs.forEach((input) => {
      input.value = "";
    });
    extraOption.innerHTML = "";
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
  <button class="remove-option" data><img class="remove-option-img" src="../img/admin/dashboard/circle-xmark.png" alt="remove option"></button>
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
