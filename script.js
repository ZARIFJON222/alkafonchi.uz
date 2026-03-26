const body = document.body;
const comparisonRange = document.getElementById("comparison-range");
const comparisonBefore = document.getElementById("comparison-before");
const comparisonDivider = document.getElementById("comparison-divider");
const comparisonFrame = document.getElementById("comparison-frame");
const roomSizeInput = document.getElementById("room-size");
const roomSizeRange = document.getElementById("room-size-range");
const acTypeSelect = document.getElementById("ac-type");
const priceOutput = document.getElementById("price-output");
const calculatorNote = document.getElementById("calculator-note");
const capacityOutput = document.getElementById("capacity-output");
const contactForm = document.getElementById("contact-form");
const submitButton = document.getElementById("submit-button");
const successToast = document.getElementById("success-toast");
const counters = document.querySelectorAll(".trust-card__number");
const revealItems = document.querySelectorAll(".reveal");
const particleLayer = document.getElementById("particle-layer");
const parallaxItems = document.querySelectorAll("[data-speed]");

body.classList.add("is-loading");

const formatter = new Intl.NumberFormat("uz-UZ");

const calculatorConfig = {
  standard: {
    name: "standard split",
    base: 850000,
    sqmRate: 32000,
    multiplier: 1,
  },
  inverter: {
    name: "inverter split",
    base: 1160000,
    sqmRate: 37000,
    multiplier: 1.18,
  },
  cassette: {
    name: "cassette",
    base: 1980000,
    sqmRate: 42000,
    multiplier: 1.45,
  },
  duct: {
    name: "duct system",
    base: 2750000,
    sqmRate: 51000,
    multiplier: 1.72,
  },
};

function createParticles() {
  if (!particleLayer) return;

  const particleCount = window.innerWidth < 768 ? 14 : 26;

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement("span");
    const size = Math.random() * 5 + 2;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${Math.random() * 18 + 16}s`;
    particle.style.animationDelay = `${Math.random() * -20}s`;
    particle.style.opacity = `${Math.random() * 0.28 + 0.08}`;

    particleLayer.appendChild(particle);
  }
}

function animateValue(element, start, end, duration, format) {
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (end - start) * eased);

    element.textContent = format(value);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function updateComparison(value) {
  if (!comparisonBefore || !comparisonDivider || !comparisonRange) return;

  const clamped = Math.min(100, Math.max(0, Number(value)));
  comparisonBefore.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
  comparisonDivider.style.left = `${clamped}%`;
  comparisonRange.value = String(clamped);
}

function setComparisonFromPointer(clientX) {
  if (!comparisonFrame) return;

  const bounds = comparisonFrame.getBoundingClientRect();
  const nextValue = ((clientX - bounds.left) / bounds.width) * 100;
  updateComparison(nextValue);
}

function estimateCapacity(roomSize) {
  if (roomSize <= 20) return "9 000 BTU tavsiya";
  if (roomSize <= 35) return "12 000 BTU tavsiya";
  if (roomSize <= 50) return "18 000 BTU tavsiya";
  if (roomSize <= 70) return "24 000 BTU tavsiya";
  return "36 000 BTU tavsiya";
}

function calculatePrice() {
  if (!roomSizeInput || !roomSizeRange || !acTypeSelect || !priceOutput || !calculatorNote || !capacityOutput) return;

  const roomSize = Math.min(120, Math.max(12, Number(roomSizeInput.value) || 12));
  const type = calculatorConfig[acTypeSelect.value];
  const rawPrice = Math.round((type.base + roomSize * type.sqmRate + roomSize * 9000) * type.multiplier);
  const previousPrice = Number(priceOutput.dataset.value || rawPrice);

  roomSizeInput.value = String(roomSize);
  roomSizeRange.value = String(roomSize);

  animateValue(priceOutput, previousPrice, rawPrice, 650, (value) => formatter.format(value));
  priceOutput.dataset.value = String(rawPrice);
  calculatorNote.textContent = `${roomSize} m² xona uchun ${type.name} tizimi tavsiya qilinadi.`;
  capacityOutput.textContent = estimateCapacity(roomSize);
}

function setupRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupCounterObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.done === "true") return;

        const target = Number(entry.target.dataset.target || 0);
        const suffix = entry.target.dataset.suffix || "";

        entry.target.dataset.done = "true";
        animateValue(entry.target, 0, target, 1600, (value) => `${value}${suffix}`);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.45,
    }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function setupParallax() {
  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;

    parallaxItems.forEach((item) => {
      const speed = Number(item.dataset.speed || 0);
      item.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
    });

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(updateParallax);
  });
}

function setupComparisonDragging() {
  if (!comparisonFrame) return;

  let dragging = false;

  comparisonFrame.addEventListener("pointerdown", (event) => {
    dragging = true;
    setComparisonFromPointer(event.clientX);
    comparisonFrame.setPointerCapture(event.pointerId);
  });

  comparisonFrame.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    setComparisonFromPointer(event.clientX);
  });

  const stopDragging = (event) => {
    if (!dragging) return;

    dragging = false;

    if (comparisonFrame.hasPointerCapture(event.pointerId)) {
      comparisonFrame.releasePointerCapture(event.pointerId);
    }
  };

  comparisonFrame.addEventListener("pointerup", stopDragging);
  comparisonFrame.addEventListener("pointercancel", stopDragging);
}

function setupForm() {
  if (!contactForm || !submitButton || !successToast) return;

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const buttonText = submitButton.querySelector(".button__text");

    submitButton.disabled = true;
    submitButton.classList.add("is-busy");
    if (buttonText) buttonText.textContent = "Yuborilmoqda...";

    window.setTimeout(() => {
      successToast.classList.add("is-visible");
      if (buttonText) buttonText.textContent = "Yuborildi";
      contactForm.reset();

      window.setTimeout(() => {
        submitButton.disabled = false;
        submitButton.classList.remove("is-busy");
        if (buttonText) buttonText.textContent = "Yuborish";
      }, 1400);

      window.setTimeout(() => {
        successToast.classList.remove("is-visible");
      }, 4200);
    }, 900);
  });
}

comparisonRange?.addEventListener("input", (event) => {
  updateComparison(event.target.value);
});

roomSizeInput?.addEventListener("input", calculatePrice);
roomSizeRange?.addEventListener("input", (event) => {
  roomSizeInput.value = event.target.value;
  calculatePrice();
});
acTypeSelect?.addEventListener("change", calculatePrice);

window.addEventListener("load", () => {
  window.setTimeout(() => {
    body.classList.remove("is-loading");
    body.classList.add("preloader-hidden");
  }, 900);
});

createParticles();
setupRevealObserver();
setupCounterObserver();
setupParallax();
setupComparisonDragging();
setupForm();
calculatePrice();
updateComparison(comparisonRange?.value || 52);
