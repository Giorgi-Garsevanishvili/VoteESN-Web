// Descrtiption : This file contains functions to handle access codes related operations such as generating QR codes for elections.

import { getAuthConfig } from "../handlers/authHandler.js";
import { message } from "../utils/message.js";
import { getAllElection } from "./election.js";

// DOM elements
const toolTitle = document.querySelector(".tool-name");
const toolContainer = document.querySelector(".tool-cont");
const generated = document.querySelector(".generated");
const tokCountBox = document.querySelector(".tok-count-box");
const resBox = document.querySelector(".el-res");

// Navigation buttons
const homeBtn = document.querySelector(".election-home-btn");
const genQRBtn = document.querySelector(".gen-qr-btn");
const getQRBtn = document.querySelector(".get-qr-btn");
const getResBtn = document.querySelector(".get-res-btn");

// Event Listener for Generating QR Codes
genQRBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  genQRBtn.classList.add("selected");
  getQRBtn.classList.remove("selected");
  getResBtn.classList.remove("selected");
  homeBtn.classList.remove("selected");

  resBox.innerHTML = "";
  toolContainer.innerHTML = "";
  generated.innerHTML = "";
  tokCountBox.classList.remove("show");
  tokCountBox.classList.add("hidden");
  toolContainer.scrollIntoView();

  const elections = await getAllElection();
  const allElections = elections.data.data.allElections;

  if (allElections.length > 0) {
    let optionsHTML = "";

    allElections.forEach((election) => {
      optionsHTML += `
    <option value="${election._id}">${election.title}</option>
    `;
    });

    const firstElection = allElections[0];

    toolTitle.innerHTML = "Generate QR Codes";

    let html = `
    <select class="election-selector">${optionsHTML}</select>
    <input disabled class="election-id hidden" placeholder="Election ID:" value="${firstElection._id}">
    <input class="voter-num" type="number" placeholder="Number of Voters">
    <button class="gen-qr">Generate Access Codes</button> 
  `;

    toolContainer.insertAdjacentHTML("afterbegin", html);

    const genQr = document.querySelector(".gen-qr");
    const selector = document.querySelector(".election-selector");
    const electionID = document.querySelector(".election-id");

    // Set the initial value of electionID to the first election's ID
    selector.addEventListener("change", (e) => {
      electionID.value = e.target.value;
      generated.innerHTML = "";
    });

    // Event listener for button to generate QR codes in the selected election.
    genQr.addEventListener("click", async (event) => {
      event.preventDefault();

      const voterNum = document.querySelector(".voter-num");

      let data = {
        electionId: String(electionID.value.trim()),
        numToken: Number(voterNum.value.trim()),
      };

      await generateQrCodes(data);
    });
  } else {
    toolContainer.innerHTML = `<h4 class="tok-used">This action is not available! Please create Election.</h4>`;
  }
});

// Function to generate QR codes
async function generateQrCodes(data) {
  try {
    const { config } = getAuthConfig();
    const genQr = document.querySelector(".gen-qr");
    genQr.disabled = true;
    const voterNum = document.querySelector(".voter-num");
    const response = await axios.post(
      `https://voteesn-api.onrender.com/api/v1/admin/election/${data.electionId}/generate-qr`,
      data,
      config
    );

    message("QR codes generated and saved", "OK", 3000);
    setTimeout(() => {
      genQr.disabled = false;
      voterNum.value = "";
    }, 2000);
    return response;
  } catch (error) {
    const genQr = document.querySelector(".gen-qr");
    genQr.disabled = false;
    message(error.response.data.message);
  }
}
