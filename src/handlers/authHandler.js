// Description: This module provides functions to handle authentication configuration, check user roles, and manage authentication state.

// get authentication configuration for API requests
export function getAuthConfig() {
  const token = localStorage.getItem("authToken");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  return { config, token };
}

// get authentication configuration for downloading ZIP files
export function getAuthConfigZip() {
  const token = localStorage.getItem("authToken");
  const configZIP = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/zip",
    },
    responseType: "blob",
  };
  return { configZIP };
}

// check if token and user information are present in localStorage
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

// check user role and redirect accordingly
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
