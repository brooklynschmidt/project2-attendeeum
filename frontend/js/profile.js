// ================================
// Profile Page JavaScript
// ================================

/**
 * Handle sign out
 */
const handleSignOut = () => {
  // TODO: Clear session/auth token when backend is connected
  console.log("Signing out...");

  // Redirect to home page
  window.location.href = "index.html";
};

/**
 * Initialize profile page
 */
const init = () => {
  const signOutBtn = document.getElementById("sign-out-btn");

  if (signOutBtn) {
    signOutBtn.addEventListener("click", handleSignOut);
  }

  // TODO: Load user data from backend when connected
  // For now, using placeholder data in HTML
};

document.addEventListener("DOMContentLoaded", init);