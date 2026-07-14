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

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const name = formData.get("name");

  formMessage.textContent = `Thanks ${name}! Your reservation request was received. We will confirm by email shortly.`;
  formMessage.className = "form-message success";
  form.reset();
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
  cartToastText.textContent = `${itemName} added to cart`;
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
  const orderTypeLabel = orderType === "delivery" ? "Delivery" : "Dine-in";
  const locationLabel = orderType === "delivery" ? "Address" : "Table";
  const itemLines = items
    .map(
      (item) =>
        `• ${item.name} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`
    )
    .join("\n");

  return [
    "🍽️ *NEW ORDER — Saffron Table*",
    "",
    `👤 *Customer:* ${customerName}`,
    `📞 *Phone:* ${phone}`,
    `🛵 *Order type:* ${orderTypeLabel}`,
    `📍 *${locationLabel}:* ${location}`,
    "",
    "*Items:*",
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
            <div class="qty-stepper" aria-label="Quantity for ${item.name}">
              <button type="button" class="qty-btn qty-btn--decrease" data-action="decrease" aria-label="Decrease ${item.name}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
              </button>
              <span class="qty-value">${item.quantity}</span>
              <button type="button" class="qty-btn qty-btn--increase" data-action="increase" aria-label="Increase ${item.name}">
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
      : `Table ${formData.get("tableNumber")}`;
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
