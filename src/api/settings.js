// Description: IP Restriction and Trusted Device Management Module

import { message } from "../utils/message.js";
import { getAuthConfig } from "../handlers/authHandler.js";

// DOM elements
const systemBTn = document.querySelector(".system");
const toolTitle = document.querySelector(".tool-name");
const toolContainer = document.querySelector(".tool-cont");
const generated = document.querySelector(".generated");
const tokCountBox = document.querySelector(".tok-count-box");
const resultBox = document.querySelector(".el-res");

// Navigation buttons
const homeBtn = document.querySelector(".election-home-btn");
const genQRBtn = document.querySelector(".gen-qr-btn");
const getQRBtn = document.querySelector(".get-qr-btn");
const getResBtn = document.querySelector(".get-res-btn");

// API endpoint for settings management
const settignsURL = `https://voteesn-api.onrender.com/api/v1/admin/voter/settings`;

// Variable to store settings data
let settingsData = "";

// Function to fetch settings from the database
async function getSettingsFromDB() {
  try {
    const { config } = getAuthConfig();
    const response = await axios.get(settignsURL, config);
    return (settingsData = response.data.settings[0]);
  } catch (error) {
    message(error.message, "error", 3000);
  }
}

// Function to update settings in the database
async function updateSettings(id, data) {
  try {
    const { config } = getAuthConfig();
    const resData = await axios.patch(
      `https://voteesn-api.onrender.com/api/v1/admin/voter/settings/${id}`,
      data,
      config
    );
    message("IP Restriction updated", "OK");
    return resData;
  } catch (error) {
    message(error.response.data.message);
  }
}

// Event listener for the system settings button, responsible for displaying and managing system settings
systemBTn.addEventListener("click", async (event) => {
  await getSettingsFromDB();
  event.preventDefault();

  homeBtn.classList.remove("selected");
  genQRBtn.classList.remove("selected");
  getQRBtn.classList.remove("selected");
  getResBtn.classList.remove("selected");

  generated.innerHTML = "";
  toolTitle.innerHTML = "System Settings";
  toolContainer.innerHTML = "";
  resultBox.innerHTML = "";
  tokCountBox.classList.add("hidden");
  tokCountBox.classList.remove("show");
  toolContainer.scrollIntoView();

  if (!settingsData) {
    message("Please Set Up settings");

    let html = `<button class="set-settings">Set Up Settings</button>

    `;

    toolContainer.insertAdjacentHTML("afterbegin", html);

    const setSettingsBtn = document.querySelector(".set-settings");

    setSettingsBtn.addEventListener("click", async (event) => {
      event.preventDefault();

      const createSetUrl = `https://voteesn-api.onrender.com/api/v1/admin/voter/settings`;
      const data = {
        ipRestrictionEnabled: false,
      };
      try {
        setSettingsBtn.disabled = true;
        const { config } = getAuthConfig();
        await axios.post(createSetUrl, data, config);
        message("Settings created", "OK", "3000");
        setTimeout(() => {
          location.reload();
        }, 2000);
      } catch (error) {
        setSettingsBtn.disabled = false;
        message(error.response.data);
      }
    });

    return;
  }

  let html = `
  <div class="settings-box">
  
  <div class="ip-res-box">
  <label class="toggle  ip-Restriction">
    <h5 class="toggle-label">IP Restriction</h5>
    <input class="toggle-checkbox check-ip" type="checkbox" ${
      !settingsData.ipRestrictionEnabled ? "" : "checked"
    }>
    <div class="toggle-switch"></div>
    </label>
    <div class="ip-rest-cont hidden ">
    <input class="allowedIPs-input" placeholder="Allowed IP: ${
      settingsData.allowedIPs
    }">
      <button class="update-ip">Update</button></div>
  </div>

  <div class="trust-dev-box">
  <label class="toggle trusted-devive">
    <h5 class="toggle-label">Trusted Device Restriction</h5>
    <input class="toggle-checkbox check-device" type="checkbox">
    <div class="toggle-switch"></div>
    </label>
    <div class="trust-rest-cont hidden">Will be added soon!</div>
  </dov>
  </div>

  <button class="del-settings">Delete Settings</button>
  `;

  toolContainer.insertAdjacentHTML("afterbegin", html);

  const deviceToggle = document.querySelector(".check-device");
  const deviceRestBox = document.querySelector(".trust-rest-cont");

  const ipToggle = document.querySelector(".check-ip");
  const ipRestBox = document.querySelector(".ip-rest-cont");

  const delSettings = document.querySelector(".del-settings");

  const updateIP = document.querySelector(".update-ip");
  const ipInput = document.querySelector(".allowedIPs-input");

  delSettings.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      delSettings.disabled = true;
      const { config } = getAuthConfig();
      await axios.delete(
        `https://voteesn-api.onrender.com/api/v1/admin/voter/settings/${settingsData._id}`,
        config
      );
      message("Settings Deleted", "OK", 3000);
      setTimeout(() => {
        location.reload();
      }, 3000);
    } catch (error) {
      delSettings.disabled = false;
      message(error.response.data.message);
    }
  });

  updateIP.addEventListener("click", async (event) => {
    event.preventDefault();
    let data = {
      allowedIPs: [String(ipInput.value)],
    };
    const { config } = getAuthConfig();
    await updateSettings(settingsData._id, data, config);
    settingsData = "";
    await getSettingsFromDB();
    ipInput.value = "";
    ipInput.placeholder = `Allowed IP: ${settingsData.allowedIPs}`;
  });

  function handleToggle(toggleElement, contentBox) {
    if (toggleElement.checked) {
      contentBox.classList.remove("hidden");
      contentBox.classList.add("show");
    } else {
      contentBox.classList.remove("show");
      contentBox.classList.add("hidden");
    }
  }

  handleToggle(ipToggle, ipRestBox);
  handleToggle(deviceToggle, deviceRestBox);

  ipToggle.addEventListener("change", async () => {
    handleToggle(ipToggle, ipRestBox);
    const data = {
      ipRestrictionEnabled: ipToggle.checked,
    };
    await updateSettings(settingsData._id, data);
  });

  deviceToggle.addEventListener("change", () => {
    handleToggle(deviceToggle, deviceRestBox);
  });
});
