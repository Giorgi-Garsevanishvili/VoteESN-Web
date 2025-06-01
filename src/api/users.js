// Description: this module handles user management functionalities such as viewing, creating, editing, and deleting users in the admin panel of the VoteESN application.
import { message } from "../utils/message.js";
import { getAuthConfig } from "../handlers/authHandler.js";

// DOM elements for user management
const userBtn = document.querySelector(".users-btn");
const userBox = document.querySelector(".see-user-box");
const closebtn = document.querySelector(".close-btn-user");
const createUserBtn = document.querySelector(".create-user-btn");
const userListDOM = document.querySelector(".users-list");

const name = document.querySelector(".name");
const email = document.querySelector(".email");
const role = document.querySelector(".role");

// URL for user management API
const usersUrl = `https://voteesn-api.onrender.com/api/v1/admin/system/users`;

// Variable to hold user data
let users = null;

// Event listener to open user management page
userBtn.addEventListener("click", (event) => {
  event.preventDefault();

  userListDOM.innerHTML = "";
  userBox.classList.remove("hidden");
  userBox.classList.add("show");
  getUsers();
});

// Event listener to close user management page
closebtn.addEventListener("click", (event) => {
  event.preventDefault();

  userBox.classList.remove("show");
  userBox.classList.add("hidden");
  message("User Page closed!", "OK", 2000);
});

// Event listener to create a new user
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

// Function to fetch and display users, sort them, and handle their last login information, and add event listeners for user management actions.
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
      <input name="lastLogin" disabled type="text" value="${lastLoginTime}" class="last-user-login ${
        user.Qirvex === true ? "hidden" : ""
      } ${
        user.lastLogin === null
          ? "never-logged"
          : lastLogin < sixMonthsAgo
          ? "logged-old"
          : "logged-six-month"
      }"/input>
      <input name="userId" disabled type="text" value="${user._id}" class="user-id hidden ${
        user.Qirvex === true ? "hidden" : ""
      }" /input>
      <input name="userName" class="name" disabled value="${
        user.name
      }" type="text" placeholder="Name"/>
      <input name="userEmail" class="email ${
        user.Qirvex === true ? "hidden" : ""
      }" disabled value="${user.email}" type="text" placeholder="Email"/>
      <select class="role ${
        user.Qirvex === true ? "hidden" : ""
      }" name="role" disabled class="role">
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
        <select class="section ${
          user.Qirvex === true ? "hidden" : ""
        }" name="section" disabled class="section">
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

// Function to reset user password by sending a reset link to the user's email
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

// Function to handle canceling the edit operation for a user
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

// Function to handle deleting a user with confirmation
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

// Function to handle editing a user by enabling input fields and showing save/cancel buttons
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
      const role = oneUser.querySelector(".role");
      const edit = oneUser.querySelector(".edit-user");
      const lastLog = oneUser.querySelector(".last-user-login");
      const section = oneUser.querySelector(".section");

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

// Function to handle saving the edited user information
function saveUserListener() {
  const save = document.querySelectorAll(".save-user");

  save.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const oneUser = event.target.closest(".one-user");

      const savebtn = oneUser.querySelector(".save-user");
      const name = oneUser.querySelector(".name");
      const email = oneUser.querySelector(".email");
      const role = oneUser.querySelector(".role");
      const section = oneUser.querySelector(".section");

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

// Function to create a new user by sending a POST request to the API
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

// Function to delete a user by sending a DELETE request to the API
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

// Function to update a user's information by sending a PATCH request to the API
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
