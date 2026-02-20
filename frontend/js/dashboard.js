// ================================
// Dashboard Page - Calendar JavaScript
// ================================

/**
 * Calendar state
 */
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();

/**
 * Month names for display
 */
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Global events array and filter state
 */
let events = [];
let activeFilter = "all";
let calendarView = "all"; // "all" or "mine"

/**
 * Get the number of days in a month
 */
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get the day of week the month starts on
 * Adjusted for Monday start (0 = Monday, 6 = Sunday)
 */
const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

/**
 * Fetch all events from the API
 */
const fetchEvents = async () => {
  try {
    const res = await fetch("/api/events");
    if (res.ok) {
      events = await res.json();
    } else {
      console.error("Failed to fetch events");
      events = [];
    }
  } catch (err) {
    console.error("Error fetching events:", err);
    events = [];
  }
};

/**
 * Fetch only my calendar events (my events + shared with me)
 */
const fetchMyCalendarEvents = async () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  try {
    const res = await fetch(`/api/events/my-calendar?email=${encodeURIComponent(currentUser.email)}`);
    if (res.ok) {
      events = await res.json();
    } else {
      console.error("Failed to fetch my calendar events");
      events = [];
    }
  } catch (err) {
    console.error("Error fetching my calendar events:", err);
    events = [];
  }
};

/**
 * Refresh events based on current view and redraw calendar
 */
const refreshCalendar = async () => {
  if (calendarView === "mine") {
    await fetchMyCalendarEvents();
  } else {
    await fetchEvents();
  }
  populateCategoryFilter();
  generateCalendar();
};

/**
 * Get filtered events based on the active category filter
 */
const getFilteredEvents = () => {
  if (activeFilter === "all") return events;
  return events.filter(ev => ev.category === activeFilter);
};

/**
 * Populate the category filter dropdown with unique categories
 */
const populateCategoryFilter = () => {
  const filterSelect = document.getElementById("category-filter");
  if (!filterSelect) return;

  // Collect unique categories
  const categories = [...new Set(
    events
      .map(ev => ev.category)
      .filter(cat => cat && cat.trim() !== "")
  )].sort();

  // Keep "All Categories" and rebuild options
  filterSelect.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filterSelect.appendChild(option);
  });

  // Restore previous selection if it still exists
  if (categories.includes(activeFilter)) {
    filterSelect.value = activeFilter;
  } else {
    activeFilter = "all";
    filterSelect.value = "all";
  }
};

/**
 * Generate calendar grid
 */
const generateCalendar = () => {
  const grid = document.getElementById("calendar-grid");
  const monthDisplay = document.getElementById("current-month");

  if (!grid || !monthDisplay) return;

  monthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  grid.innerHTML = "";

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
  const todayDate = today.getDate();

  const totalCells = 35;
  const filteredEvents = getFilteredEvents();

  for (let i = 0; i < totalCells; i++) {
    const dayElement = document.createElement("div");
    dayElement.classList.add("calendar-day");

    const dayNumber = document.createElement("span");
    dayNumber.classList.add("day-number");

    const eventsContainer = document.createElement("div");
    eventsContainer.classList.add("day-events");

    if (i < firstDay) {
      const prevDate = daysInPrevMonth - firstDay + i + 1;
      dayNumber.textContent = prevDate;
      dayElement.classList.add("other-month");
    } else if (i >= firstDay + daysInMonth) {
      const nextDate = i - firstDay - daysInMonth + 1;
      dayNumber.textContent = nextDate;
      dayElement.classList.add("other-month");
    } else {
      const date = i - firstDay + 1;
      dayNumber.textContent = date;

      if (isCurrentMonth && date === todayDate) {
        dayElement.classList.add("today");
      }

      dayElement.addEventListener("click", () => {
        handleDayClick(date);
      });

      // Render filtered events for this day
      const dayISO = new Date(currentYear, currentMonth, date).toISOString().split("T")[0];

      filteredEvents
        .filter(ev => ev.date === dayISO)
        .forEach(ev => {
          const evEl = document.createElement("div");
          evEl.classList.add("calendar-event");
          const currentUser = JSON.parse(localStorage.getItem("currentUser"));

          if (currentUser && currentUser.email === ev.createdBy) {
            evEl.classList.add("my-event");
          } else if (calendarView === "mine") {
            evEl.classList.add("shared-event");
          }

          evEl.textContent = ev.title;
          evEl.addEventListener("click", (e) => {
            e.stopPropagation();
            openViewEventModal(ev);
          });

          eventsContainer.appendChild(evEl);
        });
    }

    dayElement.appendChild(dayNumber);
    dayElement.appendChild(eventsContainer);
    grid.appendChild(dayElement);
  }
};

/**
 * Handle day click - open modal with correct date
 */
const handleDayClick = (date) => {
  const modal = document.getElementById("event-modal");
  const dateInput = document.querySelector("#event-form input[name='date']");

  const formattedDate = new Date(currentYear, currentMonth, date)
    .toISOString()
    .split("T")[0];

  dateInput.value = formattedDate;
  modal.classList.remove("hidden");
};

// ================================
// RSVP Functions
// ================================

/**
 * Send RSVP to the server
 */
const sendRSVP = async (eventId, status) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("You must be logged in to RSVP.");
    return null;
  }

  try {
    const res = await fetch(`/api/events/${eventId}/rsvp`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: currentUser.email,
        name: currentUser.name || "Anonymous",
        status
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data.attending;
    } else {
      console.error("Failed to RSVP");
      return null;
    }
  } catch (err) {
    console.error("Error sending RSVP:", err);
    return null;
  }
};

/**
 * Render the RSVP UI inside the view modal
 */
const renderRSVP = (event) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const attending = event.attending || [];

  // Find current user's RSVP status
  const myRSVP = currentUser
    ? attending.find(a => a.email === currentUser.email)
    : null;
  const myStatus = myRSVP ? myRSVP.status : null;

  // Highlight active RSVP button
  const rsvpButtons = document.querySelectorAll(".rsvp-btn");
  rsvpButtons.forEach(btn => {
    btn.classList.remove("active-going", "active-maybe", "active-not-going");
    const btnStatus = btn.dataset.status;
    if (btnStatus === myStatus) {
      btn.classList.add(`active-${btnStatus.replace("_", "-")}`);
    }
  });

  // Count attendees by status
  const goingList = attending.filter(a => a.status === "going");
  const maybeList = attending.filter(a => a.status === "maybe");

  // Render counts
  const countsEl = document.getElementById("rsvp-counts");
  const parts = [];
  if (goingList.length > 0) parts.push(`${goingList.length} Going`);
  if (maybeList.length > 0) parts.push(`${maybeList.length} Maybe`);
  countsEl.textContent = parts.length > 0 ? parts.join(" · ") : "No RSVPs yet";

  // Render attendee name lists
  const listsEl = document.getElementById("attendee-lists");
  listsEl.innerHTML = "";

  if (goingList.length > 0) {
    const goingSection = document.createElement("div");
    goingSection.classList.add("attendee-group");
    goingSection.innerHTML = `<span class="attendee-label going-label">Going</span>`;
    const names = document.createElement("p");
    names.classList.add("attendee-names");
    names.textContent = goingList.map(a => a.name).join(", ");
    goingSection.appendChild(names);
    listsEl.appendChild(goingSection);
  }

  if (maybeList.length > 0) {
    const maybeSection = document.createElement("div");
    maybeSection.classList.add("attendee-group");
    maybeSection.innerHTML = `<span class="attendee-label maybe-label">Maybe</span>`;
    const names = document.createElement("p");
    names.classList.add("attendee-names");
    names.textContent = maybeList.map(a => a.name).join(", ");
    maybeSection.appendChild(names);
    listsEl.appendChild(maybeSection);
  }
};

/**
 * Open the view event modal with RSVP functionality
 */
const openViewEventModal = (event) => {
  const modal = document.getElementById("view-event-modal");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  document.getElementById("view-event-title").textContent = event.title;
  document.getElementById("view-event-organization").textContent = event.organization;
  document.getElementById("view-event-date").textContent = event.date;
  document.getElementById("view-event-time").textContent = event.time;
  document.getElementById("view-event-location").textContent = event.location;
  document.getElementById("view-event-description").textContent = event.description;
  document.getElementById("view-event-category").textContent = event.category;

  // Render RSVP section
  renderRSVP(event);

  // Wire up RSVP buttons
  const rsvpButtons = document.querySelectorAll(".rsvp-btn");
  rsvpButtons.forEach(btn => {
    // Clone and replace to remove old listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", async () => {
      const status = newBtn.dataset.status;
      const updatedAttending = await sendRSVP(event._id, status);

      if (updatedAttending !== null) {
        // Update the local event object
        event.attending = updatedAttending;

        // Also update the event in the global events array
        const idx = events.findIndex(e => e._id === event._id);
        if (idx !== -1) {
          events[idx].attending = updatedAttending;
        }

        renderRSVP(event);
      }
    });
  });

  // Delete button (only for event creator)
  const deleteBtn = document.getElementById("delete-event-btn");
  if (currentUser && currentUser.email === event.createdBy) {
    deleteBtn.style.display = "block";
    deleteBtn.onclick = async () => {
      await deleteEvent(event._id);
      await fetchEvents();
      generateCalendar();
      modal.classList.add("hidden");
    };
  } else {
    deleteBtn.style.display = "none";
    deleteBtn.onclick = null;
  }

  modal.classList.remove("hidden");
};

/**
 * Delete an event
 */
const deleteEvent = async (eventId) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const res = await fetch(`/api/events/${eventId}`, {
      method: "DELETE",
      headers: {
        "x-user-email": currentUser?.email || "",
      },
    });

    if (!res.ok) {
      const data = await res.json();
      console.error("Failed to delete event:", data.message);
    }
  } catch (err) {
    console.error("Error deleting event:", err);
  }
};

// ================================
// Share Calendar Functions
// ================================

/**
 * Share calendar with another user
 */
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

/**
 * Unshare calendar from a user
 */
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

/**
 * Load and render the list of users I've shared my calendar with
 */
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
 * Navigate months
 */
const goToPrevMonth = () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar();
};

const goToNextMonth = () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generateCalendar();
};

/**
 * Initialize dashboard
 */
const init = async () => {
  const prevBtn = document.getElementById("prev-month");
  const nextBtn = document.getElementById("next-month");
  const modal = document.getElementById("event-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const eventForm = document.getElementById("event-form");
  const newEventBtn = document.querySelector(".calendar-actions .btn-primary");
  const filterSelect = document.getElementById("category-filter");

  // Redirect if not logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  // Load events, populate filter, render calendar
  await fetchEvents();
  populateCategoryFilter();
  generateCalendar();

  // ================================
  // View Toggle (All Events / My Calendar)
  // ================================
  const toggleAll = document.getElementById("toggle-all");
  const toggleMine = document.getElementById("toggle-mine");

  if (toggleAll) {
    toggleAll.addEventListener("click", async () => {
      calendarView = "all";
      toggleAll.classList.add("active");
      toggleMine.classList.remove("active");
      await refreshCalendar();
    });
  }

  if (toggleMine) {
    toggleMine.addEventListener("click", async () => {
      calendarView = "mine";
      toggleMine.classList.add("active");
      toggleAll.classList.remove("active");
      await refreshCalendar();
    });
  }

  // ================================
  // Share Calendar Modal
  // ================================
  const shareBtn = document.getElementById("share-calendar-btn");
  const shareModal = document.getElementById("share-modal");
  const closeShareBtn = document.getElementById("close-share-modal");
  const shareOverlay = document.getElementById("share-modal-overlay");
  const shareSubmitBtn = document.getElementById("share-submit-btn");
  const shareEmailInput = document.getElementById("share-email-input");
  const shareStatus = document.getElementById("share-status");

  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      shareModal.classList.remove("hidden");
      shareStatus.classList.add("hidden");
      shareEmailInput.value = "";
      await loadSharedList();
    });
  }

  if (closeShareBtn) {
    closeShareBtn.addEventListener("click", () => {
      shareModal.classList.add("hidden");
    });
  }

  if (shareOverlay) {
    shareOverlay.addEventListener("click", () => {
      shareModal.classList.add("hidden");
    });
  }

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

  // Navigation
  if (prevBtn) prevBtn.addEventListener("click", goToPrevMonth);
  if (nextBtn) nextBtn.addEventListener("click", goToNextMonth);

  // Category filter
  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => {
      activeFilter = e.target.value;
      generateCalendar();
    });
  }

  // Close add-event modal
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  // Close view-event modal
  const viewModal = document.getElementById("view-event-modal");
  const closeViewBtn = document.getElementById("close-view-modal");
  if (closeViewBtn) {
    closeViewBtn.addEventListener("click", () => {
      viewModal.classList.add("hidden");
    });
  }

  // Close view modal by clicking overlay
  const viewOverlay = document.getElementById("view-modal-overlay");
  if (viewOverlay) {
    viewOverlay.addEventListener("click", () => {
      viewModal.classList.add("hidden");
    });
  }

  // Modal form submission (create event)
  if (eventForm) {
    eventForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const form = e.target;
      const eventData = {
        title: form["title"].value,
        organization: form["organization"].value,
        time: form["time"].value,
        location: form["location"].value,
        date: form["date"].value,
        description: form["description"].value,
        createdBy: currentUser.email,
        category: form["category"].value,
        attending: []
      };

      try {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData)
        });

        if (res.ok) {
          alert("Event saved successfully!");
          form.reset();
          modal.classList.add("hidden");

          await refreshCalendar();
        } else {
          alert("Failed to save event.");
        }
      } catch (err) {
        console.error("Error submitting event:", err);
        alert("Server error.");
      }
    });
  }

  // New Event button opens empty modal
  if (newEventBtn) {
    newEventBtn.addEventListener("click", () => {
      eventForm.reset();
      modal.classList.remove("hidden");
    });
  }
};

document.addEventListener("DOMContentLoaded", init);