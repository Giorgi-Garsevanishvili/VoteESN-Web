// Description: This module handles user logout functionality by clearing local storage and redirecting to the login page.
// Function to log out the user
export function logOut() {
  localStorage.clear();
  window.location.href = "../../login.html";
}


