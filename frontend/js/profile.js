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

// ================================
// Share Calendar Functions
// ================================

const shareCalendar = async (targetEmail) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return null;

  try {
    const res = await fetch("/api/profile/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerEmail: currentUser.email,
        targetEmail
      })
    });

    const data = await res.json();
    return { ok: res.ok, message: data.message };
  } catch (err) {
    console.error("Error sharing calendar:", err);
    return { ok: false, message: "Server error" };
  }
};

const unshareCalendar = async (targetEmail) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  try {
    await fetch("/api/profile/unshare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerEmail: currentUser.email,
        targetEmail
      })
    });
  } catch (err) {
    console.error("Error unsharing calendar:", err);
  }
};

const loadSharedList = async () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  const listEl = document.getElementById("shared-list");
  const emptyEl = document.getElementById("shared-empty");
  listEl.innerHTML = "";

  try {
    const res = await fetch(`/api/profile/my-shares?email=${encodeURIComponent(currentUser.email)}`);
    if (!res.ok) return;

    const sharedEmails = await res.json();

    if (sharedEmails.length === 0) {
      emptyEl.classList.remove("hidden");
      return;
    }

    emptyEl.classList.add("hidden");

    sharedEmails.forEach(email => {
      const li = document.createElement("li");
      li.classList.add("shared-list-item");

      const span = document.createElement("span");
      span.textContent = email;

      const removeBtn = document.createElement("button");
      removeBtn.classList.add("btn-remove-share");
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", async () => {
        await unshareCalendar(email);
        await loadSharedList();
      });

      li.appendChild(span);
      li.appendChild(removeBtn);
      listEl.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading shared list:", err);
  }
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

  // ================================
  // Share Calendar
  // ================================
  const shareSubmitBtn = document.getElementById("share-submit-btn");
  const shareEmailInput = document.getElementById("share-email-input");
  const shareStatus = document.getElementById("share-status");

  // Load existing shares
  loadSharedList();

  if (shareSubmitBtn) {
    shareSubmitBtn.addEventListener("click", async () => {
      const targetEmail = shareEmailInput.value.trim();
      if (!targetEmail) return;

      const result = await shareCalendar(targetEmail);
      shareStatus.classList.remove("hidden");

      if (result.ok) {
        shareStatus.textContent = `Shared with ${targetEmail}!`;
        shareStatus.classList.remove("share-error");
        shareStatus.classList.add("share-success");
        shareEmailInput.value = "";
        await loadSharedList();
      } else {
        shareStatus.textContent = result.message;
        shareStatus.classList.remove("share-success");
        shareStatus.classList.add("share-error");
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", init);