import { config, configZIP } from "../handlers/authHandler.js";
import { message } from "../utils/message.js";
import { getAllElection } from "./election.js";

const toolTitle = document.querySelector(".tool-name");
const toolContainer = document.querySelector(".tool-cont");
const generated = document.querySelector(".generated");
const tokCountBox = document.querySelector(".tok-count-box");

const genQRBtn = document.querySelector(".gen-qr-btn");
const getQRBtn = document.querySelector(".get-qr-btn");

const getResBtn = document.querySelector(".get-res-btn");

genQRBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  toolContainer.innerHTML = "";
  generated.innerHTML = "";
  tokCountBox.classList.remove("show");
  tokCountBox.classList.add("hidden");

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

      clearBtn.addEventListener("click", (event) => {
        event.preventDefault();

        generated.innerHTML = "";
        clearBtn.classList.add("hidden");
        clearBtn.classList.remove("show");
      });
    }
  });
});

getQRBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  toolContainer.innerHTML = "";
  tokCountBox.classList.remove("show");
  tokCountBox.classList.add("hidden");
  generated.innerHTML = "";
  toolTitle.innerHTML = "Get Access Codes";

  const electionResponse = await getAllElection();
  const allElections = electionResponse.data.data.allElections;

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
    <input disabled class="election-id-get" placeholder="Election ID:" value="${firstElection._id}">
    <button class="get-codes">Get Codes</button>
    <button class="clear-box-get hidden">Clear</button>
    <button class="download-codes hidden">Download</button>
    <button class="delete-codes hidden">Delete</button>  
  `;

  toolContainer.insertAdjacentHTML("afterbegin", html);

  const getCodesBtn = document.querySelector(".get-codes");
  const downloadBtn = document.querySelector(".download-codes");
  const deleteBtn = document.querySelector(".delete-codes");

  const electionID = document.querySelector(".election-id-get");
  const clearBtn = document.querySelector(".clear-box-get");
  const selector = document.querySelector(".election-selector-get");

  selector.addEventListener("change", (e) => {
    generated.innerHTML = "";
    electionID.value = e.target.value;
    downloadBtn.classList.remove("show");
    downloadBtn.classList.add("hidden");
    deleteBtn.classList.remove("show");
    deleteBtn.classList.add("hidden");
    tokCountBox.classList.remove("show");
    tokCountBox.classList.add("hidden");
  });

  clearBtn.addEventListener("click", (event) => {
    event.preventDefault();

    generated.innerHTML = "";
    clearBtn.classList.add("hidden");
    clearBtn.classList.remove("show");
  });

  getCodesBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    generated.innerHTML = "";
    try {
      const response = await axios.get(
        `https://voteesn-api.onrender.com/api/v1/admin/election/tokens/${electionID.value}`,
        config
      );

      const tokens = response.data.tokens;

      let tokensHTML = "";
      tokens.forEach((token) => {
        const isUsed = token.used === false;
        tokensHTML += `
        <div class="token-list">
          <h5>Token:</h5><input disabled class="token-display ${
            isUsed ? "valid" : "invalid"
          }" value="${token.token}">
          <h5>Used:</h5><input disabled class="token-status ${
            isUsed ? "valid" : "invalid"
          }" value="${token.used}">
        </div>`;
      });

      generated.insertAdjacentHTML("afterbegin", tokensHTML);

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
      console.log(error);
    }
  });

  downloadBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      const id = electionID.value;
      await downloadQrCodes(id);
    } catch (error) {
      message(error);
    }
  });

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
      await deleteQrcodes(electionID.value);
    });

    noBtn.addEventListener("click", (event) => {
      event.preventDefault();
      message("Delete Request Rejected!", "error", 3000);
    });
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

async function downloadQrCodes(id) {
  try {
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

async function deleteQrcodes(id) {
  try {
    const getCodesBtn = document.querySelector(".get-codes");
    const downloadBtn = document.querySelector(".download-codes");
    const deleteBtn = document.querySelector(".delete-codes");
    const response = await axios.delete(
      `https://voteesn-api.onrender.com/api/v1/admin/election/${id}/generate-qr`,
      config
    );
    message(response.data.msg, "OK");

    getCodesBtn.disabled = true;
    downloadBtn.disabled = true;
    deleteBtn.disabled = true;

    setTimeout(() => {
      getCodesBtn.disabled = false;
      downloadBtn.disabled = false;
      deleteBtn.disabled = false;
      location.reload();
    }, 2000);
  } catch (error) {
    message(error.response.data.message);
    console.log(error);
  }
}
