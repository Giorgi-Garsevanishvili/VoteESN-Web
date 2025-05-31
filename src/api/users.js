import { message } from "../utils/message.js";
import { getAuthConfig } from "../handlers/authHandler.js";

const userBtn = document.querySelector(".users-btn");
const userBox = document.querySelector(".see-user-box");
const closebtn = document.querySelector(".close-btn-user");
const createUserBtn = document.querySelector(".create-user-btn");
const userListDOM = document.querySelector(".users-list");

const name = document.querySelector(".name");
const email = document.querySelector(".email");
const role = document.querySelector("#role");

const usersUrl = `https://voteesn-api.onrender.com/api/v1/admin/system/users`;

let users = null;

userBtn.addEventListener("click", (event) => {
  event.preventDefault();

  userListDOM.innerHTML = "";
  userBox.classList.remove("hidden");
  userBox.classList.add("show");
  getUsers();
});

closebtn.addEventListener("click", (event) => {
  event.preventDefault();

  userBox.classList.remove("show");
  userBox.classList.add("hidden");
  message("User Page closed!", "OK", 2000);
});

createUserBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  let newUser = {
    name: name.value.trim(),
    email: email.value.trim(),
    role: role.value,
  };

  try {
    await createUser(newUser);
    userListDOM.innerHTML = "";
    getUsers();
  } catch (error) {
    message(error.message);
    console.log(error);
  }
});

async function getUsers() {
  try {
    const { config } = getAuthConfig();
    const response = await axios.get(usersUrl, config);
    users = response.data.user;

    const admin = JSON.parse(localStorage.getItem("user"));

    if (users.length <= 0) {
      message("Users not found!");
    }

    const sortedUsers = [...users].sort((a, b) => {
      if (a._id === admin.id) return -1;
      if (b._id === admin.id) return 1;
      if (a.name.includes("Qirvex™")) return -1;
      if (b.name.includes("Qirvex™")) return 1;

      return a.name.localeCompare(b.name);
    });

    let userCount = 1;
    sortedUsers.forEach((user) => {
      const lastLogin = new Date(user.lastLogin);
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      let lastLoginTime = null;

      if (user.lastLogin !== null) {
        lastLoginTime = `Last Login: ${lastLogin
          .toISOString()
          .substring(0, 16)
          .replace("T", " ")}`;
      } else {
        lastLoginTime = `User has not logged in yet`;
      }

      const isCurrentUser = user._id === admin.id;

      let html = `
      <div class="one-user">
      <div>${userCount++}</div>
      <h3 id="MyAccount" class="${isCurrentUser ? "show" : "hidden"}">🔸Me</h3>
      <input disabled type="text" value="${lastLoginTime}" class="last-user-login ${
        user.Qirvex === true ? "hidden" : ""
      } ${
        user.lastLogin === null
          ? "never-logged"
          : lastLogin < sixMonthsAgo
          ? "logged-old"
          : "logged-six-month"
      }"/input>
      <input disabled type="text" value="${user._id}" class="user-id hidden ${
        user.Qirvex === true ? "hidden" : ""
      }" /input>
      <input class="name" disabled value="${
        user.name
      }" type="text" placeholder="Name"/>
      <input class="email ${
        user.Qirvex === true ? "hidden" : ""
      }" disabled value="${user.email}" type="text" placeholder="Email"/>
      <select class="${
        user.Qirvex === true ? "hidden" : ""
      }" name="role" disabled id="role">
          <option class="${
            user.Qirvex === true ? "hidden" : ""
          }" value="admin" ${
        user.role === "admin" ? "selected" : ""
      }>Admin</option>
          <option class="${
            user.Qirvex === true ? "hidden" : ""
          }" value="voter" ${
        user.role === "voter" ? "selected" : ""
      }>Voter</option>
        </select>
        <select class="${
          user.Qirvex === true ? "hidden" : ""
        }" name="section" disabled id="section">
          <option class="${user.Qirvex === true ? "hidden" : ""}" value="${
        admin.section
      }" ${user.section === `${admin.section}` ? "selected" : ""}>${
        admin.section
      }</option>
          <option class="${
            user.Qirvex === true ? "hidden" : ""
          }" value="Requested ${admin.section}" ${
        user.section === `Requested ${admin.section}` ? "selected" : ""
      }>Requested ${admin.section}</option>
          <option class="${
            user.Qirvex === true ? "hidden" : ""
          }" value="Demo" ${
        user.section === "Demo" ? "selected" : ""
      }>Demo</option>
        </select>
      <button class="delete-user  ${
        user.Qirvex === true ? "hidden" : ""
      }">Delete</button>
      <button class="edit-user  ${
        user.Qirvex === true ? "hidden" : ""
      }">Edit</button>
      <button class="reset-password">Reset Password</button>
      <button class="save-user hidden">Save</button>
      <button class="cancel hidden">Cancel</button>
      </div>
      `;
      userListDOM.insertAdjacentHTML("beforeend", html);
    });
    deleteUserListener();
    editUserListener();
    saveUserListener();
    cancelEditListener();
    resetPassword();
    return users;
  } catch (error) {
    message(error.message);
  }
}

function resetPassword() {
  const resetBtn = document.querySelectorAll(".reset-password");
  resetBtn.forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      event.preventDefault();
      const userContainer = event.target.closest(".one-user");
      const email = userContainer.querySelector(".email").value;

      const requestURL = `https://voteesn-api.onrender.com/api/v1/auth/reset-password-request`;

      const body = {
        email: email,
      };

      try {
        btn.disabled = true;
        await axios.post(requestURL, body);
        message("Reset Link Sent To Email", "OK", 2000);
        setTimeout(() => {
          btn.disabled = false;
        }, 2000);
      } catch (error) {
        btn.disabled = false;
        message(error.response.data.message);
      }
    });
  });
}

function cancelEditListener() {
  const cancelBtn = document.querySelectorAll(".cancel");
  cancelBtn.forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      event.preventDefault();
      userListDOM.innerHTML = "";
      await getUsers();
    });
  });
}

function deleteUserListener() {
  const deleteUserbtn = document.querySelectorAll(".delete-user");
  deleteUserbtn.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const userContainer = event.target.closest(".one-user");
      const id = userContainer.querySelector(".user-id").value;
      message(
        `Would you like to delete user?<div class="close-agree"><button class="yes-btn">Yes</button><button class="no-btn">No</button></div>`,
        "OK",
        30000
      );

      const yesBtn = document.querySelector(".yes-btn");
      const noBtn = document.querySelector(".no-btn");

      yesBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        await deleteUser(id);
        userListDOM.innerHTML = "";
        await getUsers();
      });

      noBtn.addEventListener("click", (event) => {
        event.preventDefault();
        message("Tab closing rejected, continue editing!", "error", 2000);
      });
    });
  });
}

function editUserListener() {
  const editUserBtn = document.querySelectorAll(".edit-user");
  editUserBtn.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const oneUser = event.target.closest(".one-user");

      const save = oneUser.querySelector(".save-user");
      const cancel = oneUser.querySelector(".cancel");
      const name = oneUser.querySelector(".name");
      const email = oneUser.querySelector(".email");
      const role = oneUser.querySelector("#role");
      const edit = oneUser.querySelector(".edit-user");
      const lastLog = oneUser.querySelector(".last-user-login");
      const section = oneUser.querySelector("#section");

      name.removeAttribute("disabled");
      email.removeAttribute("disabled");
      role.removeAttribute("disabled");
      section.removeAttribute("disabled");

      lastLog.classList.add("hidden");
      cancel.classList.remove("hidden");
      save.classList.remove("hidden");
      edit.classList.add("hidden");
    });
  });
}

function saveUserListener() {
  const save = document.querySelectorAll(".save-user");

  save.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const oneUser = event.target.closest(".one-user");

      const savebtn = oneUser.querySelector(".save-user");
      const name = oneUser.querySelector(".name");
      const email = oneUser.querySelector(".email");
      const role = oneUser.querySelector("#role");
      const section = oneUser.querySelector("#section");

      const id = oneUser.querySelector(".user-id").value;
      btn.addEventListener("click", async (event) => {
        event.preventDefault();
        let newUser = {
          name: name.value.trim(),
          email: email.value.trim(),
          role: role.value,
          section: section.value,
        };

        savebtn.disabled = true;
        await updateUser(id, newUser);
        setTimeout(() => {
          savebtn.disabled = false;
          userListDOM.innerHTML = "";
          getUsers();
        }, 3000);
      });
    });
  });
}

async function createUser(newUser) {
  try {
    if (newUser.name === "" || newUser.email === "" || newUser.role === "") {
      message("All fields must be filled!");
      return;
    }
    const { config } = getAuthConfig();
    await axios.post(usersUrl, newUser, config);
    message("User Created!", "OK", 2000);
    newUser = "";
    name.value = "";
    email.value = "";
    role.value = "voter";
  } catch (error) {
    message(error.response.data.message, "error", 3000);
  }
}

async function deleteUser(id) {
  try {
    const { config } = getAuthConfig();
    await axios.delete(
      `https://voteesn-api.onrender.com/api/v1/admin/system/users/${id}`,
      config
    );
    message("User Deleted", "OK", 2000);
  } catch (error) {
    message(error.message);
  }
}

async function updateUser(id, data) {
  try {
    const { config } = getAuthConfig();
    await axios.patch(
      `https://voteesn-api.onrender.com/api/v1/admin/system/users/${id}`,
      data,
      config
    );
    message("User Updated", "OK", 2000);
  } catch (error) {
    message(error.message);
  }
}
