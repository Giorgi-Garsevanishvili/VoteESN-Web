import { message } from "../utils/message.js";
import { config } from "../handlers/authHandler.js";

const userBtn = document.querySelector(".users-btn");
const userBox = document.querySelector(".see-user-box");
const closebtn = document.querySelector(".close-btn-user");

const usersUrl = `https://voteesn-api.onrender.com/api/v1/admin/system/users`;

let users = null;

userBtn.addEventListener("click", (event) => {
  event.preventDefault();

  userBox.classList.remove("hidden");
  userBox.classList.add("show");
});

closebtn.addEventListener("click", (event) => {
  event.preventDefault();

  userBox.classList.remove("show");
  userBox.classList.add("hidden");
  message("User Page closed!", "OK", 2000);
});

async function getUsers() {
  try {
    const response = await axios.get(usersUrl, config);
    users = response.data.user;

    if (users.length <= 0) {
      message("Users not found!");
    }

    return users;
  } catch (error) {
    message(error.message);
  }
}

async function createUser() {
  try {
    const response = await axios.post(usersUrl, newUser, config);
    message("User Created!", "OK", 2000);
  } catch (error) {
    message(error.message);
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
