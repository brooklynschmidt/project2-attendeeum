// ================================
// Product Page - Scroll Fade-in Animation
// ================================

/**
 * Initialize Intersection Observer for fade-in elements
 */
const initFadeInObserver = () => {
  const fadeElements = document.querySelectorAll(".fade-in");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15,
  };

  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  fadeElements.forEach((element) => {
    observer.observe(element);
  });
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initFadeInObserver);
