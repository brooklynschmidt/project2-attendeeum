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

const handleSignup = async (event) => {
  event.preventDefault();

  const form = event.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form["confirm-password"].value;

  if (!validatePasswords(password, confirmPassword)) return;

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("currentUser", JSON.stringify({
        name: data.name, email: data.email,
        description: data.description, organization: data.organization
      }));
      window.location.href = "dashboard.html";
    } else {
      alert("Failed to signup: Email taken.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error during signup.");
  }
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