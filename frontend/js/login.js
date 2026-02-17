// ================================
// Login Page JavaScript
// ================================

/**
 * Handle login form submission
 * TODO: Connect to backend API
 */
const handleLogin = async (event) => {
  event.preventDefault();

  const form = event.target;
  const email = form.email.value;
  const password = form.password.value;

  // TODO: Replace with actual API call
  console.log("Login attempt:", { email, password });

  // Placeholder: will connect to backend later
  // const response = await fetch('/api/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password })
  // });

  alert("Login functionality coming soon!");
};

/**
 * Initialize login page
 */
const init = () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
};

document.addEventListener("DOMContentLoaded", init);