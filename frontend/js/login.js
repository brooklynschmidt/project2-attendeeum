// ================================
// Login Page JavaScript
// ================================

const handleLogin = async (event) => {
  event.preventDefault();

  const form = event.target;
  const email = form.email.value;
  const password = form.password.value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("currentUser", JSON.stringify({
        name: data.name,
        email: data.email,
        description: data.description,
        organization: data.organization}));
      window.location.href = "dashboard.html";
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error("Error connecting to backend:", err);
  }
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