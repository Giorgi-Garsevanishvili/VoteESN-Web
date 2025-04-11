import { config } from "../handlers/authHandler.js";
import { message } from "../utils/message.js";
import { getAllElection } from "./election.js";

const toolTitle = document.querySelector(".tool-name");
const toolContainer = document.querySelector(".tool-cont");
const generated = document.querySelector(".generated");

const genQRBtn = document.querySelector(".gen-qr-btn");
const getQRBtn = document.querySelector(".get-qr-btn");
const delQrBtn = document.querySelector(".del-qr-btn");

const getResBtn = document.querySelector(".get-res-btn");
const delResBtn = document.querySelector(".del-res.btn");

genQRBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  toolContainer.innerHTML = "";
  generated.innerHTML = "";

  const elections = await getAllElection();
  const allElections = elections.data.data.allElections;

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
    <input disabled class="election-id" placeholder="Election ID:" value="${firstElection._id}">
    <input class="voter-num" type="number" placeholder="Number of Voters">
    <button class="gen-qr">Generate Access Codes</button>
    <button class="clear-box hidden">Clear</button>  
  `;

  toolContainer.insertAdjacentHTML("afterbegin", html);

  const genQr = document.querySelector(".gen-qr");
  const selector = document.querySelector(".election-selector");
  const electionID = document.querySelector(".election-id");
  const clearBtn = document.querySelector(".clear-box");

  selector.addEventListener("change", (e) => {
    electionID.value = e.target.value;
  });

  genQr.addEventListener("click", async (event) => {
    event.preventDefault();

    const voterNum = document.querySelector(".voter-num");

    let data = {
      electionId: String(electionID.value.trim()),
      numToken: Number(voterNum.value.trim()),
    };

    const response = await generateQrCodes(data);

    if (response) {
      const accessTokens = response.data.AccessTokens.accessToken;
      generated.innerHTML = "";
      let tokenOutput = "";
      accessTokens.forEach((el) => {
        tokenOutput = `<textarea class="token-output">${el}</textarea>`;
        generated.insertAdjacentHTML("beforeend", tokenOutput);
      });
      if (generated.innerHTML === "") {
        clearBtn.classList.add("hidden");
        clearBtn.classList.remove("show");
      } else {
        clearBtn.classList.add("show");
        clearBtn.classList.remove("hidden");
      }

      clearBtn.addEventListener('click', (event) => {
        event.preventDefault();

        generated.innerHTML = ''
        clearBtn.classList.add("hidden");
        clearBtn.classList.remove("show");
      })
    }
  });
});

async function generateQrCodes(data) {
  try {
    const genQr = document.querySelector(".gen-qr");
    const voterNum = document.querySelector(".voter-num");
    const response = await axios.post(
      `https://voteesn-api.onrender.com/api/v1/admin/election/${data.electionId}/generate-qr`,
      data,
      config
    );

    genQr.disabled = true;
    message("QR codes generated and saved", "OK", 3000);
    setTimeout(() => {
      genQr.disabled = false;
      voterNum.value = "";
    }, 2000);
    return response;
  } catch (error) {
    console.log(error);

    message(error.response.data.message);
  }
}
