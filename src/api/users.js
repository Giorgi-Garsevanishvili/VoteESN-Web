import { message } from "../utils/message.js";
import { config } from "../handlers/authHandler.js";

const userBtn = document.querySelector(".users-btn");
const userBox = document.querySelector(".see-user-box");
const closebtn = document.querySelector(".close-btn-user");
const createUserBtn = document.querySelector(".create-user-btn");

const name = document.querySelector(".name");
const email = document.querySelector(".email");
const password = document.querySelector(".password");
const role = document.querySelector("#role");

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
    console.log(users);

    return users;
  } catch (error) {
    message(error.message);
  }
}

getUsers();

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
