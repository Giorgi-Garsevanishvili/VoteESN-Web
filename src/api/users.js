import { message } from "../utils/message.js";
import { config } from "../handlers/authHandler.js";

const userBtn = document.querySelector(".users-btn");
const userBox = document.querySelector(".see-user-box");
const closebtn = document.querySelector(".close-btn-user");
const createUserBtn = document.querySelector(".create-user-btn");
const userListDOM = document.querySelector(".users-list");

const name = document.querySelector(".name");
const email = document.querySelector(".email");
const password = document.querySelector(".password");
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
    password: password.value.trim(),
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
    const response = await axios.get(usersUrl, config);
    users = response.data.user;

    if (users.length <= 0) {
      message("Users not found!");
    }

    let userCount = 1;
    users.forEach((user) => {
      let html = `
      <div class="one-user">
      <div>${userCount++}</div>
      <input disabled type="text" value="${user._id}" class="user-id" /input>
      <input class="name" disabled value="${
        user.name
      }" type="text" placeholder="Name"/>
      <input class="email" disabled value="${
        user.email
      }" type="text" placeholder="Email"/>
      <select name="role" disabled id="role">
          <option value="admin">Admin</option>
          <option value="voter">Voter</option>
        </select>
      <input class="password hidden" type="text" placeholder="Password"/>
      <button class="delete-user">Delete</button>
      <button class="edit-user">Edit</button>
      <button class="save-user hidden">Save</button>
      </div>
      `;
      userListDOM.insertAdjacentHTML("beforeend", html);
    });
    console.log(users);
    deleteUserListener();
    editUserListener();
    return users;
  } catch (error) {
    message(error.message);
  }
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
      const name = oneUser.querySelector(".name");
      const email = oneUser.querySelector(".email");
      const role = oneUser.querySelector("#role");
      const edit = oneUser.querySelector(".edit-user");
      const password = oneUser.querySelector(".password");

      name.removeAttribute("disabled");
      email.removeAttribute("disabled");
      role.removeAttribute("disabled");

      save.classList.remove("hidden");
      password.classList.remove("hidden");
      edit.classList.add("hidden");
    });
  });
}

async function createUser(newUser) {
  console.log(newUser);
  try {
    if (
      newUser.name === "" ||
      newUser.email === "" ||
      newUser.password === "" ||
      newUser.role === ""
    ) {
      message("All fields must be filled!");
      return;
    }
    await axios.post(usersUrl, newUser, config);
    message("User Created!", "OK", 2000);
    newUser = "";
    name.value = "";
    email.value = "";
    password.value = "";
    role.value = "voter";
  } catch (error) {
    message(error.response.data.message, "error", 3000);
  }
}

async function deleteUser(id) {
  try {
    const response = await axios.delete(
      `https://voteesn-api.onrender.com/api/v1/admin/system/users/${id}`,
      config
    );
    message("User Deleted", "OK", 2000);
  } catch (error) {
    message(error.message);
  }
}

async function updateUser(id) {
  try {
    const response = await axios.patch(
      `https://voteesn-api.onrender.com/api/v1/admin/system/users/${id}`,
      data,
      config
    );
    message("User Updated", "OK", 2000);
  } catch (error) {
    message(error.message);
  }
}
