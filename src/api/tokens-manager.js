// Description : This module manages access codes for elections by allowing admin to generate, retrieve, and manage QR codes for voter access. It includes functionalities for revealing tokens, sending emails, downloading codes, and deleting existing codes.

import { getAuthConfig, getAuthConfigZip } from "../handlers/authHandler.js";
import { message } from "../utils/message.js";
import { getAllElection } from "./election.js";

// DOM elements
const toolTitle = document.querySelector(".tool-name");
const toolContainer = document.querySelector(".tool-cont");
const generated = document.querySelector(".generated");
const tokCountBox = document.querySelector(".tok-count-box");
const resBox = document.querySelector(".el-res");

// Modal elements for revealing tokens
const revealModal = document.getElementById("revealModal");
const revealCancel = document.querySelector(".modal-cancel");
const revealProceed = document.querySelector(".modal-proceed");

// Modal input fields
const modalName = document.getElementById("modalName");
const modalSurname = document.getElementById("modalSurname");
const modalEmail = document.getElementById("modalEmail");

// Navigation buttons
const homeBtn = document.querySelector(".election-home-btn");
const genQRBtn = document.querySelector(".gen-qr-btn");
const getQRBtn = document.querySelector(".get-qr-btn");
const getResBtn = document.querySelector(".get-res-btn");

// Variables to manage the current reveal state
let currentRevealTargetToken = null;
let currentRevealBtn = null;
let currentTokenId = null;
let revealTimeoutId = null;

// API endpoint for revealing tokens
const revealReqUrl = `https://voteesn-api.onrender.com/api/v1/admin/election/revealToken`;

getQRBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  genQRBtn.classList.remove("selected");
  getQRBtn.classList.add("selected");
  getResBtn.classList.remove("selected");
  homeBtn.classList.remove("selected");

  toolContainer.scrollIntoView();

  resBox.innerHTML = "";
  toolContainer.innerHTML = "";
  tokCountBox.classList.remove("show");
  tokCountBox.classList.add("hidden");
  generated.innerHTML = "";
  toolTitle.innerHTML = "Get Access Codes";

  const electionResponse = await getAllElection();
  const allElections = electionResponse.data.data.allElections;

  // If there are elections available, display the election selector and buttons
  if (allElections.length > 0) {
    const firstElection = allElections[0];
    let optionsHTML = "";

    allElections.forEach((election) => {
      optionsHTML += `
    <option value="${election._id}">${election.title}</option>
    `;
    });

    let tokenCount = {
      alltok: 0,
      usedtok: 0,
      validtok: 0,
    };

    let html = `
    <select class="election-selector-get">${optionsHTML}</select>
    <input disabled class="election-id-get hidden" placeholder="Election ID:" value="${firstElection._id}">
    <button class="get-codes">Get Codes</button>
    <button class="download-codes hidden">Download</button>
    <button class="delete-codes hidden">Delete</button>  
    <button class="clear-box-get hidden">Clear</button>
  `;

    toolContainer.insertAdjacentHTML("afterbegin", html);

    const getCodesBtn = document.querySelector(".get-codes");
    const downloadBtn = document.querySelector(".download-codes");
    const deleteBtn = document.querySelector(".delete-codes");

    const electionID = document.querySelector(".election-id-get");
    const selector = document.querySelector(".election-selector-get");
    const clearBtn = document.querySelector(".clear-box-get");

    // Event listener for the election selector to update the election ID and clear the generated codes
    selector.addEventListener("change", (e) => {
      generated.innerHTML = "";
      electionID.value = e.target.value;
      downloadBtn.classList.remove("show");
      downloadBtn.classList.add("hidden");
      deleteBtn.classList.remove("show");
      deleteBtn.classList.add("hidden");
      tokCountBox.classList.remove("show");
      tokCountBox.classList.add("hidden");
      clearBtn.classList.add("hidden");
      clearBtn.classList.remove("show");
    });

    // clear button to clear the generated codes and reset the UI
    clearBtn.addEventListener("click", (event) => {
      event.preventDefault();

      generated.innerHTML = "";
      clearBtn.classList.add("hidden");
      clearBtn.classList.remove("show");
      generated.innerHTML = "";
      downloadBtn.classList.remove("show");
      downloadBtn.classList.add("hidden");
      deleteBtn.classList.remove("show");
      deleteBtn.classList.add("hidden");
      tokCountBox.classList.remove("show");
      tokCountBox.classList.add("hidden");
    });

    // getCodesBtn to fetch and display the access codes for the selected election
    getCodesBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      generated.innerHTML = "";
      try {
        const { config } = getAuthConfig();
        const response = await axios.get(
          `https://voteesn-api.onrender.com/api/v1/admin/election/tokens/${electionID.value}`,
          config
        );

        const tokens = response.data.tokens;
        clearBtn.classList.remove("hidden");
        clearBtn.classList.add("show");

        let tokensHTML = "";
        tokens.forEach((token) => {
          const isUsed = token.used === false;
          const isSent = token.sent === false;

          const realToken = token.tokenId;

          tokensHTML += `
        <div class="token-list">
          <div class="token-box">
            <h5>Token:</h5><input type="password" disabled class="token-display ${
              isUsed ? "valid" : "invalid"
            }" value="${realToken}">
            <h5>Used:</h5><input disabled class="token-status 
            " value="${isUsed ? "❌" : "✅"}">
            <h5>Sent:</h5><input disabled class="token-status mail-status
            " value="${isSent ? "❌" : "✅"}">
            <button class="reveal-token"><img
                class="reveal-token-img"
                src="../../img/login/eye-closed.svg"
                alt="reveal token"
              /></button>
          </div>
          <div class="mail-box ${isSent ? "show" : "hidden"}">
            <input class="mail-input" placeholder="Enter Email">
            <button class="mail-button">Send Email</button>
          </div>
      </div>`;
        });

        generated.insertAdjacentHTML("afterbegin", tokensHTML);

        const sendBtn = document.querySelectorAll(".mail-button");

        const revealBTN = document.querySelectorAll(".reveal-token");

        revealBTN.forEach((btn) => {
          btn.addEventListener("click", async (event) => {
            event.preventDefault();
            const targetBox = event.target.closest(".token-list");
            const targetToken = targetBox.querySelector(".token-display");
            const btn = targetBox.querySelector(".reveal-token");

            if (revealTimeoutId) {
              clearTimeout(revealTimeoutId);
              revealTimeoutId = null;
            }

            if (
              currentRevealTargetToken &&
              currentRevealTargetToken !== targetToken
            ) {
              currentRevealTargetToken.type = "password";
              currentRevealBtn.innerHTML = `<img
                class="reveal-token-img"
                src="../../img/login/eye-closed.svg"
                alt="reveal token"
              />`;
              currentRevealTargetToken.value = currentTokenId;
              currentRevealBtn.disabled = false;
            }

            currentTokenId = null;
            currentRevealTargetToken = targetToken;
            currentRevealBtn = btn;

            showModal();
          });
        });

        sendBtn.forEach((btn) => {
          btn.addEventListener("click", async (event) => {
            event.preventDefault();

            if (
              currentRevealBtn !== null &&
              currentRevealBtn.disabled === true
            ) {
              message(
                "Token Sending is Restricted While One of the Token is Reveald"
              );
              return;
            }

            const emailRegex =
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            const targetBox = event.target.closest(".token-list");
            const emailBox = targetBox.querySelector(".mail-input");
            const targetToken = targetBox.querySelector(".token-display").value;
            const recipient = targetBox.querySelector(".mail-input").value;
            const mailStatus = targetBox.querySelector(".mail-status");
            const oneEachSendBTN = targetBox.querySelector(".mail-button");

            if (!emailRegex.test(recipient)) {
              message("Please enter a valid email address.", "error", 2000);
              return;
            }

            await sendTokens(recipient, targetToken);
            mailStatus.value = "✅";
            emailBox.value = "";
            emailBox.classList.add("hidden");
            oneEachSendBTN.classList.add("hidden");
          });
        });

        const allTok = document.querySelector(".tok-count");
        const usedTok = document.querySelector(".tok-used");
        const validTok = document.querySelector(".tok-valid");

        tokenCount.alltok = tokens.length;
        tokenCount.usedtok = tokens.filter((t) => t.used === true).length;
        tokenCount.validtok = tokens.filter((t) => t.used === false).length;

        allTok.value = `ALL: ${tokenCount.alltok}`;
        usedTok.value = `USED: ${tokenCount.usedtok}`;
        validTok.value = `VALID: ${tokenCount.validtok}`;

        if (tokens) {
          tokCountBox.classList.remove("hidden");
          tokCountBox.classList.add("show");
          downloadBtn.classList.remove("hidden");
          downloadBtn.classList.add("show");
          deleteBtn.classList.remove("hidden");
          deleteBtn.classList.add("show");
        } else {
          tokCountBox.classList.remove("show");
          tokCountBox.classList.add("hidden");
          downloadBtn.classList.remove("show");
          downloadBtn.classList.add("hidden");
          deleteBtn.classList.remove("show");
          deleteBtn.classList.add("hidden");
        }
      } catch (error) {
        message(error.response.data.error);
      }
    });

    // event listener to download the QR codes as a ZIP file
    downloadBtn.addEventListener("click", async (event) => {
      event.preventDefault();

      try {
        const id = electionID.value;
        await downloadQrCodes(id);

        const emailBox = document.querySelectorAll(".mail-input");
        const mailStatus = document.querySelectorAll(".mail-status");
        const oneEachSendBTN = document.querySelectorAll(".mail-button");

        mailStatus.forEach((item) => (item.value = "✅"));
        emailBox.forEach((item) => {
          item.value = "";
          item.classList.add("hidden");
        });

        oneEachSendBTN.forEach((item) => item.classList.add("hidden"));
      } catch (error) {
        message(error);
      }
    });

    // event listener to delete the QR codes for the selected election
    deleteBtn.addEventListener("click", async (event) => {
      event.preventDefault();

      message(
        `Would you like to delete the Access Codes? <div class="close-agree"><button class="yes-btn">Yes</button><button class="no-btn">No</button></div>`,
        "OK",
        30000
      );

      const yesBtn = document.querySelector(".yes-btn");
      const noBtn = document.querySelector(".no-btn");

      yesBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        try {
          await deleteQrcodes(electionID.value);
          getCodesBtn.disabled = true;
          downloadBtn.disabled = true;
          deleteBtn.disabled = true;
          clearBtn.disabled = true;
          setTimeout(() => {
            getCodesBtn.disabled = false;
            downloadBtn.disabled = false;
            deleteBtn.disabled = false;
            clearBtn.disabled = false;
            location.reload();
          }, 2000);
        } catch (error) {}
      });

      noBtn.addEventListener("click", (event) => {
        event.preventDefault();
        message("Delete Request Rejected!", "error", 3000);
      });
    });
  } else {
    toolContainer.innerHTML = `<h4 class="tok-used">This action is not available! Please create Election.</h4>`;
  }
});

// function to show the modal for revealing tokens
function showModal() {
  revealModal.classList.remove("hidden");
  revealModal.classList.add("show");
}

// Function to hide the modal and reset input fields
function hideModal() {
  revealModal.classList.remove("show");
  revealModal.classList.add("hidden");

  modalName.value = "";
  modalEmail.value = "";
  modalSurname.value = "";
}

// Function to submit the reveal token request
async function submitReveal(tokenId) {
  if (
    !modalName.value.trim() ||
    !modalSurname.value.trim() ||
    !modalEmail.value.trim()
  ) {
    throw new Error("All fields are required!");
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(modalEmail.value.trim())) {
    throw new Error("Please enter a valid email address.");
  }

  const revealData = {
    name: modalName.value.trim(),
    surname: modalSurname.value.trim(),
    Email: modalEmail.value.trim(),
    tokenId,
    revealedAt: new Date().toLocaleString(),
  };

  localStorage.setItem("lastReveal", JSON.stringify(revealData));

  const user = JSON.parse(localStorage.getItem("user"));

  const lsdata = {
    name: user.name,
    role: user.role,
  };

  const form = {
    Name: revealData.name,
    Surname: revealData.surname,
    Email: revealData.Email,
    TokenId: revealData.tokenId,
    RevealedAt: revealData.revealedAt,
  };

  const data = {
    tokenId,
    form,
    lsdata,
  };

  const { config } = getAuthConfig();
  const tokenResponse = await axios.post(revealReqUrl, data, config);

  hideModal();

  return tokenResponse;
}

// Event listeners for the modal buttons, cancel and proceed actions

// Cancel button to hide the modal and reset the state
revealCancel.addEventListener("click", (event) => {
  event.preventDefault();
  hideModal();
  currentRevealTargetToken = null;
  currentRevealBtn = null;
});

// Proceed button to reveal the token
revealProceed.addEventListener("click", async (event) => {
  event.preventDefault();
  try {
    if (!currentRevealTargetToken) {
      return;
    }

    let tokenId = currentRevealTargetToken.value;
    currentTokenId = tokenId;
    const tokenResponse = await submitReveal(tokenId);

    const realVoterToken = tokenResponse.data.token;

    currentRevealTargetToken.value = realVoterToken;

    currentRevealTargetToken.type =
      currentRevealTargetToken.type === "password" ? "text" : "password";

    if (currentRevealTargetToken.type === `text`) {
      currentRevealBtn.innerHTML = `<img
      class="reveal-token-img"
      src="../../img/login/eye.svg"
      alt="reveal token"
    />`;
    }

    currentRevealBtn.disabled = true;
    revealTimeoutId = setTimeout(() => {
      currentRevealBtn.innerHTML = `<img
      class="reveal-token-img"
      src="../../img/login/eye-closed.svg"
      alt="reveal token"
    />`;
      currentRevealTargetToken.type = "password";
      currentRevealTargetToken.value = currentTokenId;
      currentRevealBtn.disabled = false;
      localStorage.removeItem("lastReveal");
    }, 30 * 1000);
  } catch (error) {
    currentRevealTargetToken.type = "password";
    currentRevealTargetToken.value = currentTokenId;
    if (error.message === "All fields are required!") {
      message(error.message, "error", 3000);
    } else {
      localStorage.removeItem("lastReveal");
      message(
        error.response?.data?.message || "An unknown error occurred.",
        "error",
        3000
      );
      hideModal();
    }
  }
});

// sendTokens function to send tokens via email
async function sendTokens(to, tokenId) {
  let data = {
    to,
    tokenId,
  };
  const url = `https://voteesn-api.onrender.com/api/v1/admin/election/email`;
  try {
    const { config } = getAuthConfig();
    const response = await axios.post(url, data, config);
    message(response.data.message, "OK", 3000);
  } catch (error) {
    message(error.response.data.message);
  }
}

// deleteQrcodes function to delete QR codes for a specific election
export async function deleteQrcodes(id) {
  try {
    const { config } = getAuthConfig();
    const response = await axios.delete(
      `https://voteesn-api.onrender.com/api/v1/admin/election/${id}/generate-qr`,
      config
    );
    message(response.data.msg, "OK");
  } catch (error) {
    message(error.response.data.message);
  }
}

// downloadQrCodes function to download QR codes as a ZIP file
async function downloadQrCodes(id) {
  try {
    const { configZIP } = getAuthConfigZip();
    const response = await axios.get(
      `https://voteesn-api.onrender.com/api/v1/admin/election/${id}/generate-qr`,
      configZIP
    );

    const disposition = response.headers["content-disposition"];
    let filename = "qrcodes.zip";

    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match?.[1]) {
        filename = match[1].replace(/['"]/g, "");
      }
    }

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

    message("File will download soon!", "OK", 3000);
  } catch (error) {
    message(error.response.data.message);
  }
}
