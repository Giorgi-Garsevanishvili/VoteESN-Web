const url = "https://voteesn-api.onrender.com/api/v1/admin/system/users";

const getElectionUrl = "https://voteesn-api.onrender.com/api/v1/admin/election";

const electionList = document.querySelector(".election-list");

function logOut() {
  localStorage.clear("authToken");
  localStorage.clear("user");
  window.location.href = "../../login.html";
}

async function getElection() {
  try {
    electionList.innerHTML = `Loading...`;
    const token = localStorage.getItem("authToken");

    if (!token) {
      electionList.innerHTML = "Token is not provided!";
    }

    const election = await axios.get(getElectionUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const response = election.data;
    const electionData = response.data;
    const allElections = electionData.allElections;

    if (allElections) {
      electionList.innerHTML = "";
    }

    allElections.forEach((election) => {
      html = `<button class="election-btn">
    <img class="election-img" src="../../img/admin/dashboard/ballot.png" alt="election">
    <h4>${election.title}</h4>
    <h5>${election._id}</h5>
    </button>`;
      electionList.innerHTML += html;
    });
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return (window.location.href = "../../login.html");
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const userInfo = document.querySelector(".user-info");

  userInfo.innerHTML = `Session with admin: ${user.name}`;

  getElection();
});


