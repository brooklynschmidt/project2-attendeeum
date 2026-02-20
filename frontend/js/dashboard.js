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
 * Global events array
 */
let events = [];

/**
 * Get the number of days in a month
 */
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get the day of week the month starts on (0 = Sunday, 1 = Monday, etc.)
 * Adjusted for Monday start (0 = Monday, 6 = Sunday)
 */
const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

const fetchEvents = async () => {
  try {
    const res = await fetch("/api/events");  // <-- no email filter
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

      // Render events for this day
      const dayISO = new Date(currentYear, currentMonth, date).toISOString().split("T")[0];

      events
        .filter(ev => ev.date === dayISO)
        .forEach(ev => {
          const evEl = document.createElement("div");
          evEl.classList.add("calendar-event");
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

  const deleteBtn = document.getElementById("delete-event-btn");
  if (currentUser && currentUser.email === event.createdBy) {
    deleteBtn.classList.remove("hidden");
    deleteBtn.onclick = async () => {
      await deleteEvent(event._id);
      await fetchEvents();
      generateCalendar();
      modal.classList.add("hidden");

    };
  } else {
    deleteBtn.classList.add("hidden");
  }

  modal.classList.remove("hidden");
};

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
  const filterBtn = document.querySelector(".calendar-actions .btn-outline");

  // Load events and render calendar
  await fetchEvents();
  generateCalendar();

  // Navigation
  if (prevBtn) prevBtn.addEventListener("click", goToPrevMonth);
  if (nextBtn) nextBtn.addEventListener("click", goToNextMonth);

  // Close modal
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  const viewModal = document.getElementById("view-event-modal");
  const closeViewBtn = document.getElementById("close-view-modal");
  if (closeViewBtn) {
    closeViewBtn.addEventListener("click", () => {
      viewModal.classList.add("hidden");
    });
  }

  // Modal form submission
  if (eventForm) {
    eventForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const form = e.target;
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const eventData = {
        title: form["title"].value,
        organization: form["organization"].value,
        time: form["time"].value,
        location: form["location"].value,
        date: form["date"].value,
        description: form["description"].value,
        createdBy: currentUser.email,
        category: form["category"].value
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

          // Refresh events and calendar
          await fetchEvents();
          generateCalendar();
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

  // Filter button placeholder
  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      alert("Filter events\n\n(Coming soon with backend integration)");
    });
  }
};

document.addEventListener("DOMContentLoaded", init);