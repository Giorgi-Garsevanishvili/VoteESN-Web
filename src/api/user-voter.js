import { getAuthConfig } from "../handlers/authHandler.js";
import { message } from "../utils/message.js";

const userButton = document.querySelector(".voter-user");
const userBox = document.querySelector(".user-box");
const userDetails = document.querySelector(".user-cont");
const closeBtn = document.querySelector(".close-btn");

const UserUrl = `https://voteesn-api.onrender.com/api/v1/user/account`;

async function getUser() {
  try {
    const { config } = getAuthConfig();
    const response = await axios.get(UserUrl, config);
    const user = response.data.user;
    return user;
  } catch (error) {
    message(error.response.data.message);
  }
}

async function updateUser(data) {
  try {
    const { config } = getAuthConfig();
    await axios.patch(UserUrl, data, config);
    message("Account Updated", "OK");
    setTimeout(() => {
      location.reload();
    }, 2000);
  } catch (error) {
    message(error.response.data.message);
  }
}

async function deleteAccount() {
  try {
    const { config } = getAuthConfig();
    await axios.delete(UserUrl, config);
    message("User Deleted", "OK");
    setTimeout(() => {
      location.reload();
    }, 2000);
  } catch (error) {
    console.log(error);

    message(error.response.data.message);
  }
}

closeBtn.addEventListener("click", (event) => {
  event.preventDefault();
  userBox.classList.remove("show");
  userBox.classList.add("hidden");
  userDetails.innerHTML = "";
});

userButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const user = await getUser();

  userBox.classList.add("show");

  const html = `
  <div class="user-own">
    <div class="user-img"><img class="voter-user-img" src="../../img/admin/dashboard/member-list.webp" alt="user" /></div>
    <input class="hidden" disabled type="text" value="${user._id}" /input>
     <select name="section" disabled id="section">
      <option value="Riga" ${
        user.section === "Riga" ? "selected" : ""
      }>Riga</option>
      <option value="Latvia" ${
        user.section === "Latvia" ? "selected" : ""
      }>Latvia</option>
    </select>
    <input class="name" disabled type="text" value="${user.name}" /input>
    <input class="email" disabled type="text" value="${user.email}" /input>
    <input class="hidden" disabled type="text" value="${user.role}" /input>
    <div class="buttons-box"> 
      <button class="save hidden">Save</button>
      <button class="cancel hidden">Cancel</button>
      <button class="edit-account">Edit Account</button>
      <button class="delete-user">Delete My Account</button>
    </div>
  </div>
  `;

  userDetails.insertAdjacentHTML("beforeend", html);

  const editAccount = document.querySelector(".edit-account");
  const saveAccount = document.querySelector(".save");
  const deleteUser = document.querySelector(".delete-user");
  const cancel = document.querySelector(".cancel");

  editAccount.addEventListener("click", (event) => {
    event.preventDefault();

    const name = document.querySelector(".name");
    const email = document.querySelector(".email");
    // const section = document.getElementById("section");

    editAccount.classList.add("hidden");
    saveAccount.classList.remove("hidden");
    saveAccount.classList.add("show");
    cancel.classList.remove("hidden");
    cancel.classList.add("show");

    name.disabled = false;
    email.disabled = false;
    // section.disabled = false;
  });

  saveAccount.addEventListener("click", async (event) => {
    event.preventDefault();

    saveAccount.disabled = true;
    deleteUser.disabled = true;
    cancel.disabled = true;

    const name = document.querySelector(".name");
    const email = document.querySelector(".email");

    const data = {
      name: name.value,
      email: email.value,
    };

    await updateUser(data);
  });

  deleteUser.addEventListener("click", async (event) => {
    event.preventDefault();

    saveAccount.disabled = true;
    editAccount.disabled = true;
    deleteUser.disabled = true;
    cancel.disabled = true;

    await deleteAccount();
  });

  cancel.addEventListener("click", (event) => {
    event.preventDefault();

    location.reload();
  });
});
