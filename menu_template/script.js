const API_BASE = "http://localhost:5000";

const PROMO_CODES = { SAVE10: 0.1, HALFOFF: 0.5 };

let orderItems = [];
let discount = 0;

// Menu

async function loadMenu() {
  try {
    const res = await fetch(`${API_BASE}/resources`);
    const items = await res.json();
    renderMenu(items);
  } catch (err) {
    console.error("Failed to load menu:", err);
  }
}

function renderMenu(items) {
  const grid = document.getElementById("menu-grid");
  grid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "menu-card";
    card.innerHTML = `
      <img src="${item.image_url || "placeholder.jpg"}" alt="${item.dishes}" />
      <h3>${item.dishes}</h3>
      <p class="price">$${item.menu_price.toFixed(2)}</p>
      <p class="info">${item.calories} cal | Allergens: ${item.allergens || "None"}</p>
      <button onclick='addToOrder(${JSON.stringify(item)})'>Add</button>
    `;
    grid.appendChild(card);
  });
}

// ── Order ─────────────────────────────────────────

function addToOrder(item) {
  const existing = orderItems.find((i) => i.id === item.id);
  if (existing) existing.qty++;
  else orderItems.push({ ...item, qty: 1 });
  renderOrder();
}

function renderOrder() {
  const list = document.getElementById("order-list");
  list.innerHTML = "";
  let total = 0;
  orderItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.dishes} x${item.qty} — $${(item.menu_price * item.qty).toFixed(2)}`;
    list.appendChild(li);
    total += item.menu_price * item.qty;
  });
  document.getElementById("order-total").textContent =
    `Total: $${total.toFixed(2)}`;
}

function getTotal() {
  return orderItems.reduce((sum, i) => sum + i.menu_price * i.qty, 0);
}

// ── Checkout ──────────────────────────────────────

function showCheckout() {
  if (!orderItems.length) return alert("Add items first!");
  document.getElementById("checkout-section").classList.remove("hidden");
  updateCheckoutTotal();
}

function applyPromo() {
  const code = document.getElementById("promo").value.trim().toUpperCase();
  if (PROMO_CODES[code]) {
    discount = PROMO_CODES[code];
    document.getElementById("promo-msg").textContent =
      `Code applied! ${discount * 100}% off`;
  } else {
    discount = 0;
    document.getElementById("promo-msg").textContent = "Invalid code.";
  }
  updateCheckoutTotal();
}

function updateCheckoutTotal() {
  const total = getTotal() * (1 - discount);
  document.getElementById("checkout-total").textContent =
    `Total to pay: $${total.toFixed(2)}`;
}

// ── POST to backend ───────────────────────────────

async function placeOrder() {
  const type = document.querySelector('input[name="type"]:checked').value;
  const promo = document.getElementById("promo").value.trim().toUpperCase();
  const total = getTotal() * (1 - discount);

  const payload = {
    items: orderItems,
    order_type: type,
    promo_code: promo || null,
    total: parseFloat(total.toFixed(2)),
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    document.getElementById("order-status").textContent =
      `Order #${data.orderId} placed! Total charged: $${total.toFixed(2)}`;
    orderItems = [];
    discount = 0;
    renderOrder();
    document.getElementById("checkout-section").classList.add("hidden");
  } catch (err) {
    document.getElementById("order-status").textContent = "Submission failed.";
  }
}

// ── Event Listeners ───────────────────────────────

document.getElementById("checkout-btn").addEventListener("click", showCheckout);
document.getElementById("apply-promo").addEventListener("click", applyPromo);
document.getElementById("pay-btn").addEventListener("click", placeOrder);

loadMenu();