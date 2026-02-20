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
  document.getElementById("organization").value = user.organization || "";
  document.getElementById("description").value = user.description || "";

  // Update form fields
  document.getElementById("username").value = user.name;
  document.getElementById("email").value = user.email;
  console.log(user);
};

const saveProfile = async () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const email = currentUser.email;
  const organization = document.querySelector("#organization").value;
  const description = document.querySelector("#description").value;

  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, organization, description }),
  });

  if (res.ok) {
    alert("Profile updated successfully!");
  } else {
    const data = await res.json();
    alert(`Error: ${data.message || "Failed to update profile"}`);
  }
  localStorage.setItem("currentUser", JSON.stringify({
    name: currentUser.name,
    email: currentUser.email,
    description: description,
    organization: organization
  }));
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

  document.getElementById("profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await saveProfile();
  });
};

document.addEventListener("DOMContentLoaded", init);