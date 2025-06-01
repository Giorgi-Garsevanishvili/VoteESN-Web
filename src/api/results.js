// Description : This module provides function for fetching election results, displaying them in charts, and managing the results page in the admin dashboard, 
// including downloading and deleting results.

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

// Variable to store results and statistics
let results = "";
let stats = {};

// Function to fetch election results from the server
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

// Event listener for The Get Results button, resposible to display options for selecting an election and fetching results
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
  <input disabled class="election-id-get hidden" value="${firstElection._id}">
  <button class="get-result">Get Results</button>
  <button class="download-result hidden">Download Full Report</button>
  <button class="delete-result hidden">Delete</button>  
  <button class="clear-box-result hidden">Clear</button>
`;

    toolContainer.insertAdjacentHTML("afterbegin", html);

    const electionID = document.querySelector(".election-id-get");
    const selector = document.querySelector(".election-selector-get");

    // Event listener for the election selector, updates the election ID input field when a different election is selected
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

    // Event listener for the "Get Results" button, responsible for fetching and displaying election results
    getResultBTN.addEventListener("click", async (event) => {
      event.preventDefault();

      resBox.innerHTML = "";
      generated.innerHTML = "";
      results = "";
      stats = {};

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

    // Event listener for the "Download Results" button, responsible for generating and downloading a PDF report of the election results
    downloadResultBTN.addEventListener("click", async (event) => {
      event.preventDefault();

      const { config } = getAuthConfig();
      const response = await axios.get(
        `https://voteesn-api.onrender.com/api/v1/admin/election/tokens/${electionID.value}`,
        config
      );

      const tokens = response.data.tokens;

      const total = tokens.length;
      const used = tokens.filter((t) => t.used === true).length;
      const unused = tokens.filter((t) => t.used === false).length;

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

      pdf.setFont("NotoSans_Condensed", "bold");
      pdf.setFontSize(16);
      pdf.text(systemTAG, cx, y);
      y += 10;
      pdf.text(`Election Report: ${electionTitle}`, 10, y);
      y += 7;
      pdf.setFontSize(10);
      pdf.setFont("NotoSans_Condensed", "normal");
      pdf.text(`ID:  ${electionId}`, 10, y);
      y += 7;
      pdf.text(`Generated at: ${timestamp}`, 10, y);
      y += 15;
      pdf.setFontSize(16);
      pdf.setFont("NotoSans_Condensed", "bold");
      pdf.text("Voter Access Token Stats:", 10, y);
      y += 7;
      pdf.setFontSize(10);
      pdf.setFont("NotoSans_Condensed", "normal");
      pdf.text(`Total Access Tokens: ${total}`, 10, y);
      y += 7;
      pdf.text(`Used Access Tokens: ${used}`, 10, y);
      y += 7;
      pdf.text(`Unused Access Tokens: ${unused}`, 10, y);
      y += 15;
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

          pdf.setFont("NotoSans_Condensed", "bold");
          pdf.setFontSize(12);
          pdf.text(question, 10, y);
          y += 7;

          pdf.setFont("NotoSans_Condensed", "normal");
          pdf.setFontSize(10);

          const answers = Object.keys(counts);
          const rows = answers.map((answer) => {
            const count = counts[answer];
            const percentage = totalVotes
              ? ((count / totalVotes) * 100).toFixed(1) + "%"
              : "0.0%";
            return [answer, count.toString(), percentage];
          });

          pdf.setFont("NotoSans_Condensed", "bold");
          pdf.setFontSize(11);

          pdf.text("Answer", 10, y);
          pdf.text("Votes", 50, y);
          pdf.text("Percentage", 90, y);
          y += rowHeight;

          pdf.setFont("NotoSans_Condensed", "normal");
          pdf.setFontSize(10);

          rows.forEach((row) => {
            row.forEach((text, index) => {
              if (totalVotes > total || totalVotes > used) {
                pdf.setTextColor(255, 0, 0);
              }
              pdf.text(text, 10 + index * 40, y);
            });

            if (totalVotes > total || totalVotes > used) {
              pdf.setTextColor(255, 0, 0);
              y += 7;
              pdf.text(`Disbalance Detected!`, 10, y);
              y += 7;
              pdf.setTextColor(0, 0, 0);
            }
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
  } else {
    toolContainer.innerHTML = `<h4 class="tok-used">This action is not available! Please create Election.</h4>`;
  }
});

// Function to delete election results
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
