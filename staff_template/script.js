const API_BASE = "http://127.0.0.1:8000";
const customer = JSON.parse(localStorage.getItem("customer") || "null");

// Guard: redirect non-staff users away
if (!customer || !customer.is_staff) {
  alert("Staff access only. Please log in with a staff account.");
  window.location.href = "../login_template/login.html";
}

document.getElementById("staff-greeting").textContent =
  `Logged in as ${customer.customer_name}`;

let menuItems = [];
let promos = [];
let editingMenuId = null;
let editingPromoId = null;

// ── Utilities ──────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Tab switching ──────────────────────────────────────────────────────────

function switchTab(tabId) {
  document.querySelectorAll(".staff-tab-content").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".staff-tab-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(`tab-${tabId}`).classList.remove("hidden");
  document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
}

document.querySelectorAll(".staff-tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tabId = btn.dataset.tab;
    switchTab(tabId);
    if (tabId === "alerts") loadAlerts();
  });
});

// ── Menu Management ────────────────────────────────────────────────────────

async function loadMenuItems() {
  try {
    const res = await fetch(`${API_BASE}/resources/`);
    if (!res.ok) throw new Error("Failed to load menu items");
    menuItems = await res.json();
    renderMenuTable();
  } catch (err) {
    console.error(err);
  }
}

function renderMenuTable() {
  const tbody = document.querySelector("#menu-table tbody");
  tbody.innerHTML = "";

  if (!menuItems.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-msg">No menu items found.</td></tr>';
    return;
  }

  menuItems.forEach(item => {
    const stock = parseInt(item.resource_amount) || 0;
    const stockClass = stock === 0 ? "stock-zero" : stock < 5 ? "stock-low" : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(item.dishes)}</td>
      <td>${escapeHtml(item.category)}</td>
      <td>$${Number(item.menu_price).toFixed(2)}</td>
      <td class="${stockClass}">${stock}</td>
      <td>
        <button type="button" class="btn-sm" onclick="startEditMenuItem(${item.id})">Edit</button>
        <button type="button" class="btn-sm btn-danger" onclick="deleteMenuItem(${item.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function startEditMenuItem(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;
  editingMenuId = id;
  document.getElementById("f-dishes").value = item.dishes;
  document.getElementById("f-category").value = item.category;
  document.getElementById("f-price").value = item.menu_price;
  document.getElementById("f-calories").value = item.calories;
  document.getElementById("f-ingredients").value = item.ingredients;
  document.getElementById("f-allergens").value = item.allergens || "";
  document.getElementById("f-stock").value = item.resource_amount;
  document.getElementById("menu-form-title").textContent = "Edit Menu Item";
  document.getElementById("menu-form-msg").textContent = "";
  document.getElementById("menu-form").scrollIntoView({ behavior: "smooth" });
}

function resetMenuForm() {
  editingMenuId = null;
  document.getElementById("menu-form").reset();
  document.getElementById("f-stock").value = "0";
  document.getElementById("menu-form-title").textContent = "Add Menu Item";
  document.getElementById("menu-form-msg").textContent = "";
}

async function deleteMenuItem(id) {
  if (!confirm("Delete this menu item? This cannot be undone.")) return;
  try {
    const res = await fetch(`${API_BASE}/resources/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) throw new Error(await res.text());
    await loadMenuItems();
  } catch (err) {
    alert("Failed to delete item: " + err.message);
  }
}

document.getElementById("menu-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("menu-form-msg");
  msgEl.textContent = "";

  const allergens = document.getElementById("f-allergens").value.trim();
  const payload = {
    dishes: document.getElementById("f-dishes").value.trim(),
    category: document.getElementById("f-category").value.trim(),
    menu_price: parseFloat(document.getElementById("f-price").value),
    calories: parseInt(document.getElementById("f-calories").value),
    ingredients: document.getElementById("f-ingredients").value.trim(),
    allergens: allergens || null,
    resource_amount: String(parseInt(document.getElementById("f-stock").value) || 0),
  };

  try {
    const url = editingMenuId
      ? `${API_BASE}/resources/${editingMenuId}`
      : `${API_BASE}/resources/`;
    const method = editingMenuId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());

    msgEl.textContent = editingMenuId ? "Item updated." : "Item added.";
    resetMenuForm();
    await loadMenuItems();
  } catch (err) {
    msgEl.textContent = "Save failed: " + err.message;
  }
});

document.getElementById("menu-form-cancel").addEventListener("click", resetMenuForm);

// ── Ingredient Alerts ──────────────────────────────────────────────────────

async function loadAlerts() {
  document.getElementById("stock-alerts").innerHTML = '<p class="loading-msg">Loading...</p>';
  document.getElementById("order-alerts").innerHTML = '<p class="loading-msg">Loading...</p>';

  try {
    const [menuRes, ordersRes] = await Promise.all([
      fetch(`${API_BASE}/resources/`),
      fetch(`${API_BASE}/orders/`),
    ]);

    const items = menuRes.ok ? await menuRes.json() : [];
    const orders = ordersRes.ok ? await ordersRes.json() : [];

    renderStockAlerts(items);
    renderOrderAlerts(items, orders);
  } catch (err) {
    console.error("Failed to load alerts:", err);
    document.getElementById("stock-alerts").innerHTML =
      '<p class="alert-danger">Failed to load stock data.</p>';
    document.getElementById("order-alerts").innerHTML =
      '<p class="alert-danger">Failed to load order data.</p>';
  }
}

function renderStockAlerts(items) {
  const el = document.getElementById("stock-alerts");
  const lowItems = items.filter(item => (parseInt(item.resource_amount) || 0) < 5);

  if (!lowItems.length) {
    el.innerHTML = '<p class="alert-ok">All items are well stocked.</p>';
    return;
  }

  el.innerHTML = lowItems.map(item => {
    const stock = parseInt(item.resource_amount) || 0;
    const cls = stock === 0 ? "alert-danger" : "alert-warning";
    const label = stock === 0 ? "OUT OF STOCK" : `Low stock: ${stock} left`;
    return `<div class="${cls}"><strong>${escapeHtml(item.dishes)}</strong> — ${label}</div>`;
  }).join("");
}

function renderOrderAlerts(items, orders) {
  const el = document.getElementById("order-alerts");

  // Build dish name -> stock map
  const stockMap = {};
  items.forEach(item => {
    stockMap[item.dishes] = parseInt(item.resource_amount) || 0;
  });

  const pendingOrders = orders.filter(o => o.order_status === false);
  const flagged = [];

  pendingOrders.forEach(order => {
    if (!order.order_details) return;
    const outOfStock = [];
    order.order_details.split(", ").forEach(part => {
      const dishName = part.replace(/ x\d+$/, "").trim();
      if (dishName in stockMap && stockMap[dishName] === 0) {
        outOfStock.push(dishName);
      }
    });
    if (outOfStock.length) flagged.push({ order, outOfStock });
  });

  if (!flagged.length) {
    el.innerHTML = '<p class="alert-ok">No pending orders have ingredient issues.</p>';
    return;
  }

  el.innerHTML = flagged.map(({ order, outOfStock }) => `
    <div class="alert-danger">
      <strong>Order #${order.order_num}</strong>
      (${escapeHtml(order.customer_name)}, ${order.order_type}) —
      cannot fulfill: <em>${outOfStock.map(d => escapeHtml(d)).join(", ")}</em>
    </div>
  `).join("");
}

// ── Promo Management ───────────────────────────────────────────────────────

async function loadPromos() {
  try {
    const res = await fetch(`${API_BASE}/promotions/`);
    if (!res.ok) throw new Error("Failed to load promos");
    promos = await res.json();
    renderPromoTable();
  } catch (err) {
    console.error(err);
  }
}

function renderPromoTable() {
  const tbody = document.querySelector("#promo-table tbody");
  tbody.innerHTML = "";

  if (!promos.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-msg">No promo codes found.</td></tr>';
    return;
  }

  promos.forEach(promo => {
    const expires = new Date(promo.expiration_date).toLocaleDateString();
    const isExpired = new Date(promo.expiration_date) < new Date();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(promo.promo_code)}</td>
      <td>${promo.discount_percent}%</td>
      <td class="${isExpired ? "expired" : ""}">${expires}${isExpired ? " (expired)" : ""}</td>
      <td>
        <button type="button" class="btn-sm" onclick="startEditPromo(${promo.id})">Edit</button>
        <button type="button" class="btn-sm btn-danger" onclick="deletePromo(${promo.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function startEditPromo(id) {
  const promo = promos.find(p => p.id === id);
  if (!promo) return;
  editingPromoId = id;
  document.getElementById("p-code").value = promo.promo_code;
  document.getElementById("p-discount").value = promo.discount_percent;
  const dt = new Date(promo.expiration_date);
  document.getElementById("p-expires").value = dt.toISOString().slice(0, 16);
  document.getElementById("promo-form-title").textContent = "Edit Promo Code";
  document.getElementById("promo-form-msg").textContent = "";
  document.getElementById("promo-form").scrollIntoView({ behavior: "smooth" });
}

function resetPromoForm() {
  editingPromoId = null;
  document.getElementById("promo-form").reset();
  document.getElementById("promo-form-title").textContent = "Add Promo Code";
  document.getElementById("promo-form-msg").textContent = "";
}

async function deletePromo(id) {
  if (!confirm("Delete this promo code? This cannot be undone.")) return;
  try {
    const res = await fetch(`${API_BASE}/promotions/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) throw new Error(await res.text());
    await loadPromos();
  } catch (err) {
    alert("Failed to delete promo: " + err.message);
  }
}

document.getElementById("promo-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("promo-form-msg");
  msgEl.textContent = "";

  const payload = {
    promo_code: document.getElementById("p-code").value.trim().toUpperCase(),
    discount_percent: parseFloat(document.getElementById("p-discount").value),
    expiration_date: new Date(document.getElementById("p-expires").value).toISOString(),
  };

  try {
    const url = editingPromoId
      ? `${API_BASE}/promotions/${editingPromoId}`
      : `${API_BASE}/promotions/`;
    const method = editingPromoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());

    msgEl.textContent = editingPromoId ? "Promo updated." : "Promo created.";
    resetPromoForm();
    await loadPromos();
  } catch (err) {
    msgEl.textContent = "Save failed: " + err.message;
  }
});

document.getElementById("promo-form-cancel").addEventListener("click", resetPromoForm);

// ── Logout ─────────────────────────────────────────────────────────────────

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("customer");
  window.location.href = "../login_template/login.html";
});

// ── Init ───────────────────────────────────────────────────────────────────

loadMenuItems();
loadPromos();
