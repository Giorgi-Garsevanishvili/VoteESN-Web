import { message } from "../utils/message.js";
import { config, token } from "../handlers/authHandler.js";

const systemBTn = document.querySelector(".system");
const toolTitle = document.querySelector(".tool-name");
const toolContainer = document.querySelector(".tool-cont");
const generated = document.querySelector(".generated");

const settignsURL = `https://voteesn-api.onrender.com/api/v1/admin/voter/settings`;

let settingsData = "";

async function getSettingsFromDB() {
  try {
    const response = await axios.get(settignsURL, config);
    return (settingsData = response.data.settings[0]);
  } catch (error) {
    console.log(error);
  }
}

async function updateSettings(id, data) {
  try {
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

systemBTn.addEventListener("click", async (event) => {
  await getSettingsFromDB();
  event.preventDefault();
  generated.innerHTML = "";
  toolTitle.innerHTML = "System Settings";
  toolContainer.innerHTML = "";

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
  `;

  toolContainer.insertAdjacentHTML("afterbegin", html);

  const deviceToggle = document.querySelector(".check-device");
  const deviceRestBox = document.querySelector(".trust-rest-cont");

  const ipToggle = document.querySelector(".check-ip");
  const ipRestBox = document.querySelector(".ip-rest-cont");

  const updateIP = document.querySelector(".update-ip");
  const ipInput = document.querySelector(".allowedIPs-input");

  updateIP.addEventListener("click", async (event) => {
    event.preventDefault();
    let data = {
      allowedIPs: [String(ipInput.value)],
    };
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
