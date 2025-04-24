export const token = localStorage.getItem("authToken");
export const config = {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
};

export const configZIP = {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/zip",
  },
  responseType: "blob",
};

export function checkAuth() {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    localStorage.setItem(
      "error",
      "Authentication missing: token or user not found."
    );
    throw new Error("Authentication missing: token or user not found.");
  }
}

export function checkRole() {
  const userInfo = JSON.parse(localStorage.getItem("user"));

  if (userInfo.role === "admin") {
    window.location.href = "../src/views/dashboard.html";
  } else if (userInfo.role === "voter") {
    window.location.href = "../src/views/vote.html";
  } else {
    window.location.href = "../../login.html";
  }
}
