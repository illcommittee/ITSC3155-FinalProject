// Menu page logic for the restaurant ordering demo.
// Loads menu items from the FastAPI backend, lets users add items to an order,
// applies promo codes, and submits orders/payments to the API.

const API_BASE = "http://127.0.0.1:8000";

let menuItems = [];
let orderItems = [];
let discount = 0;
let appliedPromoCode = null;

// Load menu data from the backend and render the category filters/menu cards.
async function loadMenu() {
  const message = document.getElementById("menu-message");

  try {
    const res = await fetch(`${API_BASE}/resources/`);

    if (!res.ok) {
      throw new Error(`Menu request failed with status ${res.status}`);
    }

    menuItems = await res.json();

    if (!menuItems.length) {
      message.textContent = "No menu items found. Run python seed.py first.";
      return;
    }

    renderCategoryFilter(menuItems);
    renderMenu(menuItems);
  } catch (err) {
    console.error("Failed to load menu:", err);
    message.textContent = "Failed to load menu. Make sure the API is running.";
  }
}

// Build category filter buttons from the categories returned by the API.
function renderCategoryFilter(items) {
  const categories = ["All", ...new Set(items.map(item => item.category).filter(Boolean))];
  const tabContainer = document.getElementById("category-tabs");

  tabContainer.innerHTML = "";

  categories.forEach(category => {
    const button = document.createElement("button");
    button.className = "tab-btn";
    button.textContent = category;

    if (category === "All") {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      if (category === "All") {
        renderMenu(items);
      } else {
        renderMenu(items.filter(item => item.category === category));
      }
    });

    tabContainer.appendChild(button);
  });
}

// Display menu cards for the current filtered list of items.
function renderMenu(items) {
  const grid = document.getElementById("menu-grid");
  grid.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "menu-card";

    card.innerHTML = `
      <h3>${item.dishes}</h3>
      <p class="price">$${Number(item.menu_price).toFixed(2)}</p>
      <p class="info">${item.calories} cal</p>
      <p class="info">Category: ${item.category}</p>
      <p class="info">Ingredients: ${item.ingredients}</p>
      <p class="info">Allergens: ${item.allergens || "None"}</p>
      <button type="button">Add</button>
    `;

    card.querySelector("button").addEventListener("click", () => addToOrder(item));
    grid.appendChild(card);
  });
}

// Add a selected menu item to the current order or increase its quantity.
function addToOrder(item) {
  const existing = orderItems.find(orderItem => orderItem.id === item.id);

  if (existing) {
    existing.qty += 1;
  } else {
    orderItems.push({ ...item, qty: 1 });
  }

  renderOrder();
}

// Recalculate and display the current order items and total.
function renderOrder() {
  const list = document.getElementById("order-list");
  list.innerHTML = "";

  orderItems.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.dishes} x${item.qty} — $${(item.menu_price * item.qty).toFixed(2)}`;
    list.appendChild(li);
  });

  document.getElementById("order-total").textContent = `Total: $${getTotal().toFixed(2)}`;
}

function getTotal() {
  return orderItems.reduce((sum, item) => sum + item.menu_price * item.qty, 0);
}

// Displaying what's in the checkout
function showCheckout() {
  if (!orderItems.length) {
    alert("Add items first.");
    return;
  }

  document.getElementById("checkout-section").classList.remove("hidden");
  updateCheckoutTotal();
}

// Validate a promo code against the backend and apply its discount.
async function applyPromo() {
  const code = document.getElementById("promo").value.trim().toUpperCase();
  const promoMessage = document.getElementById("promo-msg");

  if (!code) {
    discount = 0;
    appliedPromoCode = null;
    promoMessage.textContent = "No promo code applied.";
    updateCheckoutTotal();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/promotions/validate/${code}`);

    if (!res.ok) {
      throw new Error("Invalid promo code");
    }

    const promo = await res.json();
    discount = Number(promo.discount_percent) / 100;
    appliedPromoCode = promo.promo_code;

    promoMessage.textContent = `${promo.promo_code} applied. ${promo.discount_percent}% off.`;
  } catch (err) {
    console.error("Promo failed:", err);
    discount = 0;
    appliedPromoCode = null;
    promoMessage.textContent = "Invalid or expired promo code.";
  }

  updateCheckoutTotal();
}

function updateCheckoutTotal() {
  const total = getTotal() * (1 - discount);
  document.getElementById("checkout-total").textContent = `Total to pay: $${total.toFixed(2)}`;
}

async function placeOrder() {
  const customerName = document.getElementById("card-name").value.trim();

  if (!customerName) {
    alert("Please enter your name.");
    return;
  }

  const orderType = document.querySelector('input[name="type"]:checked').value;
  const paymentType = document.getElementById("payment-type").value;
  const total = getTotal() * (1 - discount);
  const orderNumber = Math.floor(2000 + Math.random() * 7000);
  const trackingNumber = `WEB${orderNumber}`;

  const savedCustomer = JSON.parse(localStorage.getItem("customer") || "null");
  const customerId = savedCustomer ? savedCustomer.id : 1;

  const orderPayload = {
    order_num: orderNumber,
    customer_id: customerId,
    customer_name: customerName,
    tracking_num: trackingNumber,
    order_status: false,
    total_price: Number(total.toFixed(2)),
    order_details: orderItems.map(item => `${item.dishes} x${item.qty}`).join(", "),
    order_type: orderType
  };

  try {
    const orderRes = await fetch(`${API_BASE}/orders/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    if (!orderRes.ok) {
      const errorText = await orderRes.text();
      throw new Error(errorText);
    }

    const order = await orderRes.json();

    const paymentPayload = {
      order_id: order.id,
      total_price: order.total_price,
      card_info: "Frontend demo payment",
      transaction_status: "Completed",
      payment_type: paymentType,
      promo_code: appliedPromoCode
    };

    await fetch(`${API_BASE}/payment-info/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentPayload),
    });

    finishOrder(order.tracking_num, total);
  } catch (err) {
    console.error("Order failed:", err);
    alert("Order failed. Check that the API is running and seeded.");
  }
}

// Reset the order UI after a successful checkout.
function finishOrder(trackingNumber, total) {
  document.getElementById("order-status").textContent =
    `Order placed. Tracking number: ${trackingNumber}. Total charged: $${total.toFixed(2)}.`;

  orderItems = [];
  discount = 0;
  appliedPromoCode = null;

  renderOrder();
  updateCheckoutTotal();

  document.getElementById("promo").value = "";
  document.getElementById("promo-msg").textContent = "";
  document.getElementById("checkout-section").classList.add("hidden");
}

document.getElementById("checkout-btn").addEventListener("click", showCheckout);
document.getElementById("apply-promo").addEventListener("click", applyPromo);
document.getElementById("pay-btn").addEventListener("click", placeOrder);

loadMenu();