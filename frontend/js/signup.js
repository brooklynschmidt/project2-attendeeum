// ================================
// Sign Up Page JavaScript
// ================================

/**
 * Validate password match
 */
const validatePasswords = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return false;
  }
  return true;
};

/**
 * Handle signup form submission
 * TODO: Connect to backend API
 */
const handleSignup = async (event) => {
  event.preventDefault();

  const form = event.target;
  const name = form.name.value;
  const email = form.email.value;
  const password = form.password.value;
  const confirmPassword = form["confirm-password"].value;

  // Validate passwords match
  if (!validatePasswords(password, confirmPassword)) {
    return;
  }

  // TODO: Replace with actual API call
  console.log("Signup attempt:", { name, email, password });

  // Placeholder: will connect to backend later
  // const response = await fetch('/api/auth/signup', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ name, email, password })
  // });

  // Temporary redirect to dashboard
  window.location.href = "dashboard.html";
};

/**
 * Initialize signup page
 */
const init = () => {
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }
};

document.addEventListener("DOMContentLoaded", init);