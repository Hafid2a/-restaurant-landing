const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const form = document.getElementById("reservation-form");
const formMessage = document.getElementById("form-message");

const cartToggle = document.getElementById("cart-toggle");
const floatingCartToggle = document.getElementById("floating-cart-toggle");
const cartToast = document.getElementById("cart-toast");
const cartToastText = document.getElementById("cart-toast-text");
const cartClose = document.getElementById("cart-close");
const checkoutClose = document.getElementById("checkout-close");
const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const cartView = document.getElementById("cart-view");
const checkoutView = document.getElementById("checkout-view");
const cartItemsEl = document.getElementById("cart-items");
const cartEmptyEl = document.getElementById("cart-empty");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const cartClearBtn = document.getElementById("cart-clear");
const cartCheckoutBtn = document.getElementById("cart-checkout");
const checkoutBackBtn = document.getElementById("checkout-back");
const checkoutSummaryList = document.getElementById("checkout-summary-list");
const checkoutTotalEl = document.getElementById("checkout-total");
const checkoutForm = document.getElementById("checkout-form");
const checkoutMessage = document.getElementById("checkout-message");
const orderSuccessModal = document.getElementById("order-success-modal");
const orderSuccessBackdrop = document.getElementById("order-success-backdrop");
const orderSuccessClose = document.getElementById("order-success-close");
const deliveryField = document.getElementById("delivery-field");
const tableField = document.getElementById("table-field");
const deliveryAddressInput = checkoutForm.querySelector('[name="deliveryAddress"]');
const tableNumberInput = checkoutForm.querySelector('[name="tableNumber"]');

const WHATSAPP_NUMBER = "34624877121";

// Cart state: [{ name, price, quantity }]
let cart = [];
let panelMode = "cart";
let toastTimer;

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

window.addEventListener("scroll", () => {
  document.querySelector(".header")?.classList.toggle("scrolled", window.scrollY > 60);
}, { passive: true });

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const name = formData.get("name");
  const date = formData.get("date");
  const time = formData.get("time");
  const guests = formData.get("guests");

  if (!date) {
    formMessage.textContent = "Selecciona una fecha en el calendario.";
    formMessage.className = "booking-message error";
    return;
  }

  if (!time) {
    formMessage.textContent = "Selecciona una hora para tu reserva.";
    formMessage.className = "booking-message error";
    return;
  }

  formMessage.textContent = `¡Gracias, ${name}! Reserva recibida para ${guests} persona(s) el ${date} a las ${time}. Te confirmaremos por correo en breve.`;
  formMessage.className = "booking-message success";
  form.reset();
  if (bookingDateInput && selectedBookingDate) {
    bookingDateInput.value = formatBookingDate(selectedBookingDate);
  }
});

const bookingCalendarEl = document.getElementById("booking-calendar");
const bookingDateInput = document.getElementById("booking-date");
const waitlistBtn = document.getElementById("waitlist-btn");
const groupBtn = document.getElementById("group-btn");

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEKDAYS_ES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

let calendarView = new Date();
let selectedBookingDate = null;

function formatBookingDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function renderBookingCalendar() {
  if (!bookingCalendarEl) return;

  const year = calendarView.getFullYear();
  const month = calendarView.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = `
    <div class="booking-cal-header">
      <span class="booking-cal-month">${MONTHS_ES[month]} ${year}</span>
      <div class="booking-cal-nav">
        <button type="button" data-cal-nav="-1" aria-label="Mes anterior">‹</button>
        <button type="button" data-cal-nav="1" aria-label="Mes siguiente">›</button>
      </div>
    </div>
    <div class="booking-cal-weekdays">
      ${WEEKDAYS_ES.map((day) => `<span>${day}</span>`).join("")}
    </div>
    <div class="booking-cal-days">
  `;

  for (let i = 0; i < startOffset; i += 1) {
    html += `<button type="button" class="booking-cal-day is-other-month" disabled></button>`;
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const isPast = date < today;
    const isSelected = selectedBookingDate && isSameDay(date, selectedBookingDate);
    const classes = [
      "booking-cal-day",
      isPast ? "is-past" : "",
      isSelected ? "is-selected" : "",
    ]
      .filter(Boolean)
      .join(" ");

    html += `<button type="button" class="${classes}" data-date="${formatBookingDate(date)}" ${isPast ? "disabled" : ""}>${day}</button>`;
  }

  html += `</div>`;
  bookingCalendarEl.innerHTML = html;
}

function initBookingCalendar() {
  if (!bookingCalendarEl) return;

  selectedBookingDate = new Date();
  selectedBookingDate.setHours(0, 0, 0, 0);
  calendarView = new Date(selectedBookingDate);
  if (bookingDateInput) {
    bookingDateInput.value = formatBookingDate(selectedBookingDate);
  }
  renderBookingCalendar();

  bookingCalendarEl.addEventListener("click", (event) => {
    const navBtn = event.target.closest("[data-cal-nav]");
    if (navBtn) {
      calendarView.setMonth(calendarView.getMonth() + Number(navBtn.dataset.calNav));
      renderBookingCalendar();
      return;
    }

    const dayBtn = event.target.closest("[data-date]");
    if (!dayBtn || dayBtn.disabled) return;

    const [y, m, d] = dayBtn.dataset.date.split("-").map(Number);
    selectedBookingDate = new Date(y, m - 1, d);
    if (bookingDateInput) {
      bookingDateInput.value = dayBtn.dataset.date;
    }
    renderBookingCalendar();
  });
}

initBookingCalendar();

waitlistBtn?.addEventListener("click", () => {
  formMessage.textContent = "Solicitud de lista de espera recibida. Te contactaremos si hay disponibilidad.";
  formMessage.className = "booking-message success";
});

groupBtn?.addEventListener("click", () => {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, me gustaría hacer una solicitud de reserva para un grupo en Dar Diafa.")}`, "_blank", "noopener,noreferrer");
});

function triggerQtyFeedback(itemName) {
  requestAnimationFrame(() => {
    const itemEl = cartItemsEl.querySelector(
      `.cart-item[data-name="${CSS.escape(itemName)}"]`
    );

    if (itemEl) {
      itemEl.classList.remove("cart-item--pulse");
      const qtyEl = itemEl.querySelector(".qty-value");
      qtyEl?.classList.remove("qty-value--bump");
      void itemEl.offsetWidth;
      itemEl.classList.add("cart-item--pulse");
      qtyEl?.classList.add("qty-value--bump");

      setTimeout(() => {
        itemEl.classList.remove("cart-item--pulse");
        qtyEl?.classList.remove("qty-value--bump");
      }, 420);
    }

    document.querySelectorAll(".cart-count").forEach((badge) => {
      badge.classList.remove("cart-count--bump");
      void badge.offsetWidth;
      badge.classList.add("cart-count--bump");
      setTimeout(() => badge.classList.remove("cart-count--bump"), 420);
    });

    floatingCartToggle.classList.remove("floating-cart-toggle--bump");
    void floatingCartToggle.offsetWidth;
    floatingCartToggle.classList.add("floating-cart-toggle--bump");
    setTimeout(() => floatingCartToggle.classList.remove("floating-cart-toggle--bump"), 420);
  });
}

function addToCart(name, price) {
  const existing = cart.find((item) => item.name === name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  renderCart();
  triggerQtyFeedback(name);
  showCartToast(name);
}

function showCartToast(itemName) {
  cartToastText.textContent = `${itemName} añadido al carrito`;
  cartToast.hidden = false;
  cartToast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    cartToast.classList.remove("show");
    cartToast.hidden = true;
  }, 2200);
}

function updateQuantity(name, delta) {
  const item = cart.find((entry) => entry.name === name);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter((entry) => entry.name !== name);
  }

  renderCart();

  if (cart.some((entry) => entry.name === name)) {
    triggerQtyFeedback(name);
  }

  if (cart.length === 0 && panelMode === "checkout") {
    setPanelMode("cart");
  }
}

function clearCart() {
  cart = [];
  renderCart();

  if (panelMode === "checkout") {
    setPanelMode("cart");
  }
}

function getCartCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function formatPrice(amount) {
  return `€${amount.toFixed(2)}`;
}

function buildWhatsAppOrderMessage({ customerName, phone, orderType, location, items, total }) {
  const orderTypeLabel = orderType === "delivery" ? "A domicilio" : "En el local";
  const locationLabel = orderType === "delivery" ? "Dirección" : "Mesa";
  const itemLines = items
    .map(
      (item) =>
        `• ${item.name} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`
    )
    .join("\n");

  return [
    "🍽️ *NUEVO PEDIDO — Dar Diafa*",
    "",
    `👤 *Cliente:* ${customerName}`,
    `📞 *Teléfono:* ${phone}`,
    `🛵 *Tipo de pedido:* ${orderTypeLabel}`,
    `📍 *${locationLabel}:* ${location}`,
    "",
    "*Platos:*",
    itemLines,
    "",
    `💰 *Total:* ${formatPrice(total)}`,
  ].join("\n");
}

function openWhatsAppOrder(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function showOrderSuccessModal() {
  orderSuccessModal.hidden = false;
  orderSuccessModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("success-modal-open");

  requestAnimationFrame(() => {
    orderSuccessModal.classList.add("open");
  });
}

function hideOrderSuccessModal() {
  orderSuccessModal.classList.remove("open");
  orderSuccessModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("success-modal-open");

  setTimeout(() => {
    orderSuccessModal.hidden = true;
  }, 320);
}

function renderCart() {
  const count = getCartCount();
  const total = getCartTotal();
  const hasItems = cart.length > 0;

  document.querySelectorAll(".cart-count").forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
  cartTotalEl.textContent = formatPrice(total);
  checkoutTotalEl.textContent = formatPrice(total);
  cartClearBtn.disabled = !hasItems;
  cartCheckoutBtn.disabled = !hasItems;
  cartEmptyEl.hidden = hasItems;

  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
        <li class="cart-item" data-name="${item.name}">
          <div class="cart-item-info">
            <strong>${item.name}</strong>
            <span>${item.quantity} × ${formatPrice(item.price)}</span>
            <span class="cart-item-line-total">${formatPrice(item.price * item.quantity)}</span>
          </div>
          <div class="cart-item-actions">
            <div class="qty-stepper" aria-label="Cantidad de ${item.name}">
              <button type="button" class="qty-btn qty-btn--decrease" data-action="decrease" aria-label="Reducir ${item.name}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
              </button>
              <span class="qty-value">${item.quantity}</span>
              <button type="button" class="qty-btn qty-btn--increase" data-action="increase" aria-label="Aumentar ${item.name}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
              </button>
            </div>
          </div>
        </li>
      `
    )
    .join("");

  checkoutSummaryList.innerHTML = cart
    .map(
      (item) => `
        <li class="checkout-summary-item">
          <div>
            <strong>${item.name}</strong>
            <span>${item.quantity} × ${formatPrice(item.price)}</span>
          </div>
          <strong>${formatPrice(item.price * item.quantity)}</strong>
        </li>
      `
    )
    .join("");
}

function setOrderType(type) {
  const isDelivery = type === "delivery";

  deliveryField.classList.toggle("is-visible", isDelivery);
  tableField.classList.toggle("is-visible", !isDelivery);

  deliveryField.setAttribute("aria-hidden", String(!isDelivery));
  tableField.setAttribute("aria-hidden", String(isDelivery));

  deliveryAddressInput.required = isDelivery;
  tableNumberInput.required = !isDelivery;
  deliveryAddressInput.disabled = !isDelivery;
  tableNumberInput.disabled = isDelivery;

  if (isDelivery) {
    tableNumberInput.value = "";
  } else {
    deliveryAddressInput.value = "";
  }
}

function setPanelMode(mode) {
  panelMode = mode;
  const isCheckout = mode === "checkout";

  cartPanel.classList.toggle("checkout-mode", isCheckout);
  cartView.hidden = isCheckout;
  checkoutView.hidden = !isCheckout;

  if (isCheckout) {
    renderCart();
    setOrderType(checkoutForm.orderType.value);
  }
}

function setPanelOpen(isOpen) {
  cartPanel.classList.toggle("open", isOpen);
  cartOverlay.hidden = !isOpen;
  cartPanel.setAttribute("aria-hidden", String(!isOpen));
  cartToggle.setAttribute("aria-expanded", String(isOpen));
  floatingCartToggle.setAttribute("aria-expanded", String(isOpen));
  floatingCartToggle.hidden = isOpen;

  if (!isOpen) {
    setPanelMode("cart");
    checkoutMessage.textContent = "";
    checkoutMessage.className = "form-message";
  }
}

document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".menu-card");
    const name = card.dataset.name;
    const price = Number(card.dataset.price);

    addToCart(name, price);
  });
});

cartItemsEl.addEventListener("click", (event) => {
  const button = event.target.closest(".qty-btn");
  if (!button) return;

  const itemEl = button.closest(".cart-item");
  const name = itemEl.dataset.name;
  const delta = button.dataset.action === "increase" ? 1 : -1;

  updateQuantity(name, delta);
});

function toggleCartPanel() {
  const willOpen = !cartPanel.classList.contains("open");
  if (willOpen) setPanelMode("cart");
  setPanelOpen(willOpen);
}

cartToggle.addEventListener("click", toggleCartPanel);
floatingCartToggle.addEventListener("click", toggleCartPanel);

cartClose.addEventListener("click", () => setPanelOpen(false));
checkoutClose.addEventListener("click", () => setPanelOpen(false));
cartOverlay.addEventListener("click", () => setPanelOpen(false));

cartClearBtn.addEventListener("click", clearCart);

cartCheckoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;
  setPanelMode("checkout");
});

checkoutBackBtn.addEventListener("click", () => {
  setPanelMode("cart");
  checkoutMessage.textContent = "";
  checkoutMessage.className = "form-message";
});

checkoutForm.orderType.forEach((radio) => {
  radio.addEventListener("change", () => setOrderType(radio.value));
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (cart.length === 0) return;

  const formData = new FormData(checkoutForm);
  const customerName = formData.get("customerName");
  const phone = formData.get("phone");
  const orderType = formData.get("orderType");
  const location =
    orderType === "delivery"
      ? formData.get("deliveryAddress")
      : `Mesa ${formData.get("tableNumber")}`;
  const orderItems = cart.map((item) => ({ ...item }));
  const total = getCartTotal();

  const message = buildWhatsAppOrderMessage({
    customerName,
    phone,
    orderType,
    location,
    items: orderItems,
    total,
  });

  setPanelOpen(false);
  showOrderSuccessModal();

  setTimeout(() => {
    openWhatsAppOrder(message);
  }, 3000);

  clearCart();
  checkoutForm.reset();
  setOrderType("delivery");
  checkoutMessage.textContent = "";
  checkoutMessage.className = "form-message";
});

orderSuccessClose.addEventListener("click", hideOrderSuccessModal);
orderSuccessBackdrop.addEventListener("click", hideOrderSuccessModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && orderSuccessModal.classList.contains("open")) {
    hideOrderSuccessModal();
  }
});

setOrderType("delivery");
renderCart();

const menuSidebarLinks = document.querySelectorAll(".menu-sidebar-link");
const menuCategories = document.querySelectorAll(".menu-category[id]");

menuSidebarLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuSidebarLinks.forEach((item) => item.classList.remove("is-active"));
    link.classList.add("is-active");
  });
});

if (menuCategories.length && menuSidebarLinks.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        menuSidebarLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
  );

  menuCategories.forEach((section) => observer.observe(section));
}
