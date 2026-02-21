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
  console.log(name);
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

    if (res.ok) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          description: "",
          organization: "",
        }),
      );
      window.location.href = "dashboard.html";
    } else {
      alert("Failed to signup: Email taken.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error during signup.");
  }

  console.log(localStorage.getItem("currentUser"));
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
