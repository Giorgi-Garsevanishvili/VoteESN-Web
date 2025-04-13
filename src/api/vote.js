import { checkAuth, config } from "../handlers/authHandler.js";
import { message } from "../utils/message.js";

const url = `https://voteesn-api.onrender.com/api/v1/user/voter`;

async function getElectionVoter() {
  const response = await axios.get(url, config);
  console.log(response);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    checkAuth();
    const user = JSON.parse(localStorage.getItem("user"));
    if (user.role === "voter") {
      await getElectionVoter();
    } else if (user.role === "admin") {
      return (window.location.href = "../views/dashboard.html");
    } else {
      return (window.location.href = "../../login.html");
    }
  } catch (error) {
    message(error.message);
    setTimeout(() => {
      localStorage.clear();
      return (window.location.href = "../../login.html");
    }, 5000);
  }
});
