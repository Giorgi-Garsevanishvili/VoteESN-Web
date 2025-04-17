import { message } from "../utils/message.js";
import { config, token } from "../handlers/authHandler.js";

const systemBTn = document.querySelector(".system");
const toolTitle = document.querySelector(".tool-name");
const toolContainer = document.querySelector(".tool-cont");
const generated = document.querySelector(".generated");

const settignsURL = `https://voteesn-api.onrender.com/api/v1/admin/voter/settings`;
const settingsUpdateURL = `https://voteesn-api.onrender.com/api/v1/admin/voter/settings/`;

systemBTn.addEventListener("click", async (event) => {
  event.preventDefault();
  generated.innerHTML = "";
  toolTitle.innerHTML = "System Settings";
  toolContainer.innerHTML = "";

  try {
    const response = await axios.get(settignsURL, config);
    console.log(response);
  } catch (error) {
    console.log(error);
  }

  let html = `
  <div class="settings-box">
  
  <div class="ip-res-box">
  <label class="toggle  ip-Restriction">
    <h5 class="toggle-label">IP Restriction</h5>
    <input class="toggle-checkbox" type="checkbox">
    <div class="toggle-switch"></div>
    </label>
    <div class="ip-rest-cont">asdasasfasfd</div>
  </div>

  <div class="trust-dev-box">
  <label class="toggle trusted-devive">
    <h5 class="toggle-label">Trusted Device Restriction</h5>
    <input class="toggle-checkbox" type="checkbox">
    <div class="toggle-switch"></div>
    </label>
    <div class="trust-rest-cont">Will be added soon!</div>
  </dov>
  </div>
  `;

  toolContainer.insertAdjacentHTML("afterbegin", html);
});
