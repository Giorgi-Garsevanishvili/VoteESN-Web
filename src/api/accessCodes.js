import { getAuthConfig, getAuthConfigZip } from "../handlers/authHandler.js";
import { message } from "../utils/message.js";
import { getAllElection } from "./election.js";

const toolTitle = document.querySelector(".tool-name");
const toolContainer = document.querySelector(".tool-cont");
const generated = document.querySelector(".generated");
const tokCountBox = document.querySelector(".tok-count-box");
const resBox = document.querySelector(".el-res");

const revealModal = document.getElementById("revealModal");
const revealCancel = document.querySelector(".modal-cancel");
const revealProceed = document.querySelector(".modal-proceed");

const modalName = document.getElementById("modalName");
const modalSurname = document.getElementById("modalSurname");
const modalEmail = document.getElementById("modalEmail");

const homeBtn = document.querySelector(".election-home-btn");
const genQRBtn = document.querySelector(".gen-qr-btn");
const getQRBtn = document.querySelector(".get-qr-btn");
const getResBtn = document.querySelector(".get-res-btn");

const revealReqUrl = `https://voteesn-api.onrender.com/api/v1/admin/election/revealToken`;

let results = "";
let stats = {};
let currentRevealTargetToken = null;
let currentRevealBtn = null;
let currentTokenId = null;
let revealTimeoutId = null;

function showModal() {
  revealModal.classList.remove("hidden");
  revealModal.classList.add("show");
}

function hideModal() {
  revealModal.classList.remove("show");
  revealModal.classList.add("hidden");

  modalName.value = "";
  modalEmail.value = "";
  modalSurname.value = "";
}

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

revealCancel.addEventListener("click", (event) => {
  event.preventDefault();
  hideModal();
  currentRevealTargetToken = null;
  currentRevealBtn = null;
});

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
    <input disabled class="election-id" placeholder="Election ID:" value="${firstElection._id}">
    <input class="voter-num" type="number" placeholder="Number of Voters">
    <button class="gen-qr">Generate Access Codes</button> 
  `;

    toolContainer.insertAdjacentHTML("afterbegin", html);

    const genQr = document.querySelector(".gen-qr");
    const selector = document.querySelector(".election-selector");
    const electionID = document.querySelector(".election-id");

    selector.addEventListener("change", (e) => {
      electionID.value = e.target.value;
      generated.innerHTML = "";
    });

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
    <input disabled class="election-id-get" placeholder="Election ID:" value="${firstElection._id}">
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

getResBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  homeBtn.classList.remove("selected");
  genQRBtn.classList.remove("selected");
  getQRBtn.classList.remove("selected");
  getResBtn.classList.add("selected");

  toolContainer.scrollIntoView();

  toolContainer.innerHTML = "";
  tokCountBox.classList.remove("show");
  tokCountBox.classList.add("hidden");
  generated.innerHTML = "";
  toolTitle.innerHTML = "Get Results";

  const electionResponse = await getAllElection();
  const allElections = electionResponse.data.data.allElections;

  if (allElections.length > 0) {
    const firstElection = allElections[0];

    let optionsHTML = "";

    allElections.forEach((election) => {
      optionsHTML += `
  <option value="${election._id}">${election.title}</option>
  `;
    });

    let html = `
  <select class="election-selector-get">${optionsHTML}</select>
  <input disabled class="election-id-get" value="${firstElection._id}">
  <button class="get-result">Get Results</button>
  <button class="download-result hidden">Download Full Report</button>
  <button class="delete-result hidden">Delete</button>  
  <button class="clear-box-result hidden">Clear</button>
`;

    toolContainer.insertAdjacentHTML("afterbegin", html);

    const electionID = document.querySelector(".election-id-get");
    const selector = document.querySelector(".election-selector-get");

    selector.addEventListener("change", (e) => {
      resBox.innerHTML = "";
      results = "";
      stats = {};
      generated.innerHTML = "";
      electionID.value = e.target.value;
      downloadResultBTN.classList.remove("show");
      downloadResultBTN.classList.add("hidden");
      deleteResultBTN.classList.remove("show");
      deleteResultBTN.classList.add("hidden");
      tokCountBox.classList.remove("show");
      tokCountBox.classList.add("hidden");
      clearBTN.classList.remove("show");
      clearBTN.classList.add("hidden");
    });

    const getResultBTN = document.querySelector(".get-result");
    const downloadResultBTN = document.querySelector(".download-result");
    const deleteResultBTN = document.querySelector(".delete-result");
    const clearBTN = document.querySelector(".clear-box-result");

    getResultBTN.addEventListener("click", async (event) => {
      event.preventDefault();

      resBox.innerHTML = "";
      generated.innerHTML = "";
      results = "";

      try {
        await getResults(electionID.value);
      } catch (error) {
        return;
      }

      if (results.length > 0) {
        downloadResultBTN.classList.remove("hidden");
        downloadResultBTN.classList.add("show");
        deleteResultBTN.classList.remove("hidden");
        deleteResultBTN.classList.add("show");
        clearBTN.classList.remove("hidden");
        clearBTN.classList.add("show");
      }

      const flatAnswers = results.flat();

      function normalize(str) {
        return str.trim().toLowerCase();
      }

      flatAnswers.forEach(({ question, selectedOption }) => {
        const qKey = normalize(question);
        const aKey = normalize(selectedOption);

        if (!stats[qKey]) {
          stats[qKey] = {};
        }

        if (!stats[qKey][aKey]) {
          stats[qKey][aKey] = 0;
        }

        stats[qKey][aKey]++;
      });

      let html = `<div id="charts"></div>`;

      generated.insertAdjacentHTML("afterbegin", html);

      const container = document.getElementById("charts");
      let chartIndex = 0;

      Object.entries(stats).forEach(([question, option]) => {
        const chartBox = document.createElement("div");
        chartBox.classList.add("chart-container");

        const questionTitle = document.createElement("h4");
        questionTitle.textContent = question;
        chartBox.appendChild(questionTitle);

        const canvas = document.createElement("canvas");
        canvas.id = `chart-${chartIndex++}`;
        chartBox.appendChild(canvas);

        container.appendChild(chartBox);

        const labels = Object.keys(option);
        const values = Object.values(option);

        const data = {
          labels: labels,
          datasets: [
            {
              label: labels,
              data: values,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(255, 205, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(201, 203, 207, 0.2)",
              ],
              borderColor: [
                "rgb(255, 99, 132)",
                "rgb(255, 159, 64)",
                "rgb(255, 205, 86)",
                "rgb(75, 192, 192)",
                "rgb(54, 162, 235)",
                "rgb(153, 102, 255)",
                "rgb(201, 203, 207)",
              ],
              borderWidth: 1,
            },
          ],
        };

        const config = {
          type: "bar",
          data: data,
          options: {
            responsive: true,
            layout: {
              padding: {
                top: 5,
                bottom: 5,
              },
            },
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  font: {
                    size: 14,
                  },
                  generateLabels: function (chart) {
                    const data = chart.data;
                    return data.labels.map((label, i) => {
                      const value = data.datasets[0].data[i];
                      const color = data.datasets[0].backgroundColor[i];
                      return {
                        text: `${label}: ${value}`,
                        fillStyle: color,
                        strokeStyle: color,
                        index: i,
                      };
                    });
                  },
                },
              },
              datalabels: {
                color: "#000",
                font: {
                  weight: "bold",
                  size: 14,
                },
                formatter: (value, context) => `${value}`,
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.label || "";
                    const value = context.parsed || 0;
                    return `${label}: ${value} votes`;
                  },
                },
              },
            },
          },
          plugins: [ChartDataLabels],
        };

        new Chart(canvas, config);
      });

      downloadResultBTN.addEventListener("click", async (event) => {
        event.preventDefault();

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");

        const logoUrl = "../../img/admin/dashboard/Qirvex-stamp.png";

        const selectedOption = selector.options[selector.selectedIndex];
        const electionTitle = selectedOption.text;
        const electionId = selectedOption.value;
        const timestamp = new Date().toLocaleString();

        const pageWidth = pdf.internal.pageSize.getWidth();
        const systemTAG = `voteESN Election System Report`;
        const tagWidth = pdf.getTextWidth(systemTAG);
        const cx = (pageWidth - tagWidth) / 2;

        let y = 15;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text(systemTAG, cx, y);
        y += 10;
        pdf.text(
          `Election Report: ${electionTitle} (ID: ${electionId})`,
          10,
          y
        );
        y += 7;
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Generated at: ${timestamp}`, 10, y);
        y += 10;

        const logoImg = new Image();
        logoImg.crossOrigin = "Anonymous";
        logoImg.src = logoUrl;

        logoImg.onload = async () => {
          pdf.addImage(logoImg, "PNG", 160, 30, 40, 10);

          for (const question in stats) {
            const counts = stats[question];
            const totalVotes = Object.values(counts).reduce(
              (sum, count) => sum + count,
              0
            );
            let rowHeight = 6;

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(question, 10, y);
            y += 7;

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);

            const answers = Object.keys(counts);
            const rows = answers.map((answer) => {
              const count = counts[answer];
              const percentage = totalVotes
                ? ((count / totalVotes) * 100).toFixed(1) + "%"
                : "0.0%";
              return [answer, count.toString(), percentage];
            });

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(11);

            pdf.text("Answer", 10, y);
            pdf.text("Votes", 50, y);
            pdf.text("Percentage", 90, y);
            y += rowHeight;

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);

            rows.forEach((row) => {
              row.forEach((text, index) => {
                pdf.text(text, 10 + index * 40, y);
              });
              y += rowHeight;
            });

            y += 6;

            if (y + rowHeight * (rows.length + 2) > 280) {
              pdf.addPage();
              y = 20;
            }
          }

          pdf.save(`Election_Report_${electionId}.pdf`);
        };
      });

      clearBTN.addEventListener("click", (event) => {
        event.preventDefault();

        generated.innerHTML = "";
        clearBTN.classList.add("hidden");
        clearBTN.classList.remove("show");
        generated.innerHTML = "";
        downloadResultBTN.classList.remove("show");
        downloadResultBTN.classList.add("hidden");
        deleteResultBTN.classList.remove("show");
        deleteResultBTN.classList.add("hidden");
        tokCountBox.classList.remove("show");
        tokCountBox.classList.add("hidden");
      });

      deleteResultBTN.addEventListener("click", (event) => {
        event.preventDefault;

        message(
          `Would you like to delete the Access Codes? <div class="close-agree"><button class="yes-btn">Yes</button><button class="no-btn">No</button></div>`,
          "OK",
          30000
        );

        const yesBtn = document.querySelector(".yes-btn");
        const noBtn = document.querySelector(".no-btn");

        yesBtn.addEventListener("click", async (event) => {
          event.preventDefault();
          await deleteResult(electionID.value);
          setTimeout(() => {
            location.reload();
          }, 3000);
        });

        noBtn.addEventListener("click", (event) => {
          event.preventDefault();
          message("Delete Request Rejected!", "error", 3000);
        });
      });
    });
  } else {
    toolContainer.innerHTML = `<h4 class="tok-used">This action is not available! Please create Election.</h4>`;
  }
});

async function generateQrCodes(data) {
  try {
    const { config } = getAuthConfig();
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
    message(error.response.data.message);
  }
}

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

async function getResults(id) {
  try {
    const { config } = getAuthConfig();
    const response = await axios.get(
      `https://voteesn-api.onrender.com/api/v1/admin/election/${id}/results`,
      config
    );
    const result = response.data.result;
    results = result;
  } catch (error) {
    message(error.response.data.message);
    throw new Error(error);
  }
}

export async function deleteResult(id) {
  try {
    const getResultBTN = document.querySelector(".get-result");
    const downloadResultBTN = document.querySelector(".download-result");
    const deleteResultBTN = document.querySelector(".delete-result");
    const clearBTN = document.querySelector(".clear-box-result");

    const { config } = getAuthConfig();
    const response = await axios.delete(
      `https://voteesn-api.onrender.com/api/v1/admin/election/${id}/results
`,
      config
    );
    message(response.data, "OK");

    getResultBTN.disabled = true;
    downloadResultBTN.disabled = true;
    deleteResultBTN.disabled = true;
    clearBTN.disabled = true;

    setTimeout(() => {
      getResultBTN.disabled = false;
      downloadResultBTN.disabled = false;
      deleteResultBTN.disabled = false;
      clearBTN.disabled = false;
    }, 2000);
  } catch (error) {
    message(error.response.data.message);
  }
}
