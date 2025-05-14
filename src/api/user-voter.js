import { getAuthConfig } from "../handlers/authHandler.js";
import { message } from "../utils/message.js";

const userButton = document.querySelector(".voter-user");
const userBox = document.querySelector(".user-box");
const userDetails = document.querySelector(".user-details");

async function getUser() {
  const getUserUrl = `https://voteesn-api.onrender.com/api/v1/user/account`;

  try {
    const { config } = getAuthConfig();
    const response = await axios.get(getUserUrl, config);
    const user = response.data.user;
    return user;
  } catch (error) {
    message(error.response.data.message);
  }
}

userButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const user = await getUser();
  console.log(user);

  userBox.classList.add("show");

  const html = `
  <div class="user-cont">
    <h2>User Info</h2>
    <input class="hidden" disabled type="text" value="${user._id}" /input>
    <input disabled type="text" value="${user.name}" /input>
    <input disabled type="text" value="${user.email}" /input>
    <input disabled type="text" value="${user.role}" /input>
    <input disabled type="text" value="${user.section}" /input>
  </div>

  `;

  userDetails.insertAdjacentHTML("afterbegin", html);
});
