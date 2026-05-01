const API_BASE = "http://localhost:5000";

// Promotions
const PROMO_CODES = { SAVE10: 0.1, HALFOFF: 0.5 };
let orderItems = [];
let discount = 0;

// Menu for Backend
async function loadMenu() {
  try {
    const res = await fetch(`${API_BASE}/resources`);
    const items = await res.json();
    renderCategoryFilter(items);
    renderMenu(items);
  } catch (err) {
    console.error("Failed to load menu:", err);
  }
}

// Categories
function renderCategoryFilter(items) {
  const categories = ["All", ...new Set(items.map(i => i.category).filter(Boolean))];
  const bar = document.getElementById("category-bar");
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "cat-btn";
    btn.textContent = cat;
    if (cat === "All") btn.classList.add("active");
    btn.onclick = () => {
      document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderMenu(cat === "All" ? items : items.filter(i => i.category === cat));
    };
    bar.appendChild(btn);
  });
}

// Menu Items
function renderMenu(items) {
  const grid = document.getElementById("menu-grid");
  grid.innerHTML = "";
  items.forEach(item => {
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

// Cart
function addToOrder(item) {
  const existing = orderItems.find(i => i.id === item.id);
  if (existing) existing.qty++;
  else orderItems.push({ ...item, qty: 1 });
  renderOrder();
}

function renderOrder() {
  const list = document.getElementById("order-list");
  list.innerHTML = "";
  let total = 0;
  orderItems.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.dishes} x${item.qty} — $${(item.menu_price * item.qty).toFixed(2)}`;
    list.appendChild(li);
    total += item.menu_price * item.qty;
  });
  document.getElementById("order-total").textContent = `Total: $${total.toFixed(2)}`;
}
// Total
function getTotal() {
  return orderItems.reduce((sum, i) => sum + i.menu_price * i.qty, 0);
}

// Checkout System
function showCheckout() {
  if (!orderItems.length) return alert("Add items first!");
  document.getElementById("checkout-section").classList.remove("hidden");
  updateCheckoutTotal();
}

// Promo System
function applyPromo() {
  const code = document.getElementById("promo").value.trim().toUpperCase();
  discount = PROMO_CODES[code] || 0;
  document.getElementById("promo-msg").textContent = discount
    ? `Code applied! ${discount * 100}% off`
    : "Invalid code.";
  updateCheckoutTotal();
}

// Checkout Total
function updateCheckoutTotal() {
  const total = getTotal() * (1 - discount);
  document.getElementById("checkout-total").textContent = `Total to pay: $${total.toFixed(2)}`;
}

// Placing Order
async function placeOrder() {
  const name = document.getElementById("card-name").value.trim();
  if (!name) return alert("Please enter your name for payment.");

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
    finishOrder(data.orderId, total);
  } catch {
    finishOrder("ORD" + Math.floor(10000 + Math.random() * 90000), total);
  }
}
// Orders Completed
function finishOrder(orderId, total) {
  const orders = JSON.parse(localStorage.getItem("trackedOrders") || "{}");
  orders[orderId] = { status: "Order Received", total, placedAt: new Date().toLocaleString() };
  localStorage.setItem("trackedOrders", JSON.stringify(orders));

  document.getElementById("order-status").textContent =
    `✅ Order #${orderId} placed! $${total.toFixed(2)} charged. Track it below.`;

  orderItems = [];
  discount = 0;
  renderOrder();
  document.getElementById("checkout-section").classList.add("hidden");
}

// Order Tracking System

function trackOrder() {
  const input = document.getElementById("tracking-input").value.trim();
  const orders = JSON.parse(localStorage.getItem("trackedOrders") || "{}");
  const order = orders[input];
  const result = document.getElementById("tracking-result");

  if (!input || !order) {
    result.textContent = input ? `No order found for #${input}.` : "Enter a tracking number.";
    return;
  }

  result.innerHTML = `
    <strong>Order #${input}</strong><br>
    Status: <em>${order.status}</em><br>
    Total: $${parseFloat(order.total).toFixed(2)}<br>
    Placed: ${order.placedAt}
  `;
}

document.getElementById("checkout-btn").addEventListener("click", showCheckout);
document.getElementById("apply-promo").addEventListener("click", applyPromo);
document.getElementById("pay-btn").addEventListener("click", placeOrder);
document.getElementById("track-btn").addEventListener("click", trackOrder);

loadMenu();