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

/**
 * Generate calendar grid
 */
const generateCalendar = () => {
  const grid = document.getElementById("calendar-grid");
  const monthDisplay = document.getElementById("current-month");

  if (!grid || !monthDisplay) return;

  // Update month display
  monthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  // Clear existing grid
  grid.innerHTML = "";

  // Get calendar data
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);

  // Today's date for highlighting
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
  const todayDate = today.getDate();

  // Total cells needed (5 rows x 7 days = 35)
  const totalCells = 35;

  // Generate days
  for (let i = 0; i < totalCells; i++) {
    const dayElement = document.createElement("div");
    dayElement.classList.add("calendar-day");

    const dayNumber = document.createElement("span");
    dayNumber.classList.add("day-number");

    // Events container for future use
    const eventsContainer = document.createElement("div");
    eventsContainer.classList.add("day-events");

    if (i < firstDay) {
      // Previous month days
      const prevDate = daysInPrevMonth - firstDay + i + 1;
      dayNumber.textContent = prevDate;
      dayElement.classList.add("other-month");
    } else if (i >= firstDay + daysInMonth) {
      // Next month days
      const nextDate = i - firstDay - daysInMonth + 1;
      dayNumber.textContent = nextDate;
      dayElement.classList.add("other-month");
    } else {
      // Current month days
      const date = i - firstDay + 1;
      dayNumber.textContent = date;

      // Highlight today
      if (isCurrentMonth && date === todayDate) {
        dayElement.classList.add("today");
      }

      // Add click handler for adding events (placeholder)
      dayElement.addEventListener("click", () => {
        handleDayClick(date);
      });
    }

    dayElement.appendChild(dayNumber);
    dayElement.appendChild(eventsContainer);
    grid.appendChild(dayElement);
  }
};

/**
 * Handle day click (placeholder for adding events)
 */
const handleDayClick = (date) => {
  // TODO: Open add event modal
  console.log(`Clicked on ${monthNames[currentMonth]} ${date}, ${currentYear}`);
  alert(`Add event for ${monthNames[currentMonth]} ${date}, ${currentYear}\n\n(Coming soon with backend integration)`);
};

/**
 * Navigate to previous month
 */
const goToPrevMonth = () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar();
};

/**
 * Navigate to next month
 */
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
const init = () => {
  // Generate initial calendar
  generateCalendar();

  // Add event listeners for navigation
  const prevBtn = document.getElementById("prev-month");
  const nextBtn = document.getElementById("next-month");

  if (prevBtn) {
    prevBtn.addEventListener("click", goToPrevMonth);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", goToNextMonth);
  }

  // New Event button (placeholder)
  const newEventBtn = document.querySelector(".calendar-actions .btn-primary");
  if (newEventBtn) {
    newEventBtn.addEventListener("click", () => {
      alert("Add new event\n\n(Coming soon with backend integration)");
    });
  }

  // Filter button (placeholder)
  const filterBtn = document.querySelector(".calendar-actions .btn-outline");
  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      alert("Filter events\n\n(Coming soon with backend integration)");
    });
  }
};

document.addEventListener("DOMContentLoaded", init);