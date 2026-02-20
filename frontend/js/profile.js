// ================================
// Profile Page JavaScript
// ================================

/**
 * Handle sign out
 */
const handleSignOut = () => {
  console.log("Signing out...");
  localStorage.removeItem("currentUser");

  window.location.href = "index.html";
};

const loadUserProfile = () => {
  const storedUser = localStorage.getItem("currentUser");

  if (storedUser === null) {
    window.location.href = "index.html";
    return;
  }

  const user = JSON.parse(storedUser);

  // Update header display
  document.querySelector(".profile-display-name").textContent = user.name;
  document.querySelector(".profile-email-display").textContent = user.email;

  // Update form fields
  document.getElementById("username").value = user.name;
  document.getElementById("email").value = user.email;
};

/**
 * Initialize profile page
 */
const init = () => {
  const signOutBtn = document.getElementById("sign-out-btn");

  if (signOutBtn) {
    signOutBtn.addEventListener("click", handleSignOut);
  }
  loadUserProfile();
};

document.addEventListener("DOMContentLoaded", init);