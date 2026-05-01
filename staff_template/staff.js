const API = "http://localhost:8000";

// Switch between tabs

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((t) => t.classList.add("hidden"));
    btn.classList.add("active");
    document
      .getElementById(`tab-${btn.dataset.tab}`)
      .classList.remove("hidden");
  });
});

// Functions for orders

function statusBadge(done) {
  return done
    ? '<span class="badge done">Completed</span>'
    : '<span class="badge pending">Pending</span>';
}

function orderRow(o) {
  return `
    <tr>
      <td>#${o.order_num}</td>
      <td>${o.customer_name}</td>
      <td>${o.order_type}</td>
      <td>${o.dish_names || "—"}</td>
      <td>$${o.total_price.toFixed(2)}</td>
      <td>${statusBadge(o.order_status)}</td>
      <td>${new Date(o.order_date).toLocaleDateString()}</td>
      <td class="mono">${o.tracking_num}</td>
      <td>
        <button class="sm-btn complete-btn" data-id="${o.id}" data-done="${o.order_status}">
          ${o.order_status ? "Mark Pending" : "Mark Done"}
        </button>
      </td>
    </tr>
  `;
}

async function loadOrders(startDate = null, endDate = null) {
  let url = `${API}/orders/`;
  const params = [];
  if (startDate) params.push(`start_date=${startDate}`);
  if (endDate) params.push(`end_date=${endDate}`);
  if (params.length) url += "?" + params.join("&");

  const listEl = document.getElementById("orders-list");
  try {
    const res = await fetch(url);
    const orders = await res.json();
    if (!orders.length) {
      listEl.innerHTML = "<p class='muted'>No orders found.</p>";
      return;
    }
    listEl.innerHTML = `
      <table>
        <thead><tr>
          <th>Order</th><th>Customer</th><th>Type</th><th>Items</th>
          <th>Total</th><th>Status</th><th>Date</th><th>Tracking</th><th>Action</th>
        </tr></thead>
        <tbody>${orders.map(orderRow).join("")}</tbody>
      </table>
    `;
    listEl.querySelectorAll(".complete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const currentDone = btn.dataset.done === "true";
        await fetch(`${API}/orders/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_status: !currentDone }),
        });
        loadOrders(startDate, endDate);
      });
    });
  } catch {
    listEl.innerHTML = "<p class='error'>Failed to load orders.</p>";
  }
}

document.getElementById("filter-orders-btn").addEventListener("click", () => {
  loadOrders(
    document.getElementById("start-date").value || null,
    document.getElementById("end-date").value || null,
  );
});

document.getElementById("clear-filter-btn").addEventListener("click", () => {
  document.getElementById("start-date").value = "";
  document.getElementById("end-date").value = "";
  loadOrders();
});

// Functions for revenue

async function fetchRevenue(date = null) {
  let url = `${API}/orders/revenue`;
  if (date) url += `?target_date=${date}`;
  const resultEl = document.getElementById("revenue-result");
  try {
    const res = await fetch(url);
    const data = await res.json();
    resultEl.classList.remove("hidden");
    resultEl.innerHTML = `
      <p class="rev-date">Date: <strong>${data.date}</strong></p>
      <p class="rev-amount">$${data.revenue.toFixed(2)}</p>
      <p class="rev-count">${data.order_count} order${data.order_count !== 1 ? "s" : ""}</p>
    `;
  } catch {
    resultEl.classList.remove("hidden");
    resultEl.textContent = "Failed to fetch revenue.";
  }
}

document.getElementById("revenue-btn").addEventListener("click", () => {
  const d = document.getElementById("revenue-date").value;
  if (!d) {
    alert("Pick a date.");
    return;
  }
  fetchRevenue(d);
});

document
  .getElementById("all-revenue-btn")
  .addEventListener("click", () => fetchRevenue());

// Functions for promo codes

async function loadPromos() {
  const listEl = document.getElementById("promos-list");
  try {
    const res = await fetch(`${API}/promotions/`);
    const promos = await res.json();
    if (!promos.length) {
      listEl.innerHTML = "<p class='muted'>No promo codes yet.</p>";
      return;
    }
    const now = new Date();
    listEl.innerHTML = promos
      .map((p) => {
        const exp = new Date(p.expiration_date);
        const expired = exp < now;
        return `
        <div class="promo-row-item ${expired ? "expired" : ""}">
          <span class="promo-code-label">${p.promo_code}</span>
          <span class="promo-pct">${p.discount_percent}% off</span>
          <span class="promo-exp">Expires: ${exp.toLocaleDateString()} ${expired ? "(EXPIRED)" : ""}</span>
          <button class="sm-btn del-promo" data-id="${p.id}">Delete</button>
        </div>
      `;
      })
      .join("");
    listEl.querySelectorAll(".del-promo").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await fetch(`${API}/promotions/${btn.dataset.id}`, {
          method: "DELETE",
        });
        loadPromos();
      });
    });
  } catch {
    listEl.innerHTML = "<p class='error'>Failed to load promos.</p>";
  }
}

document
  .getElementById("create-promo-btn")
  .addEventListener("click", async () => {
    const code = document
      .getElementById("promo-code")
      .value.trim()
      .toUpperCase();
    const discount = parseFloat(
      document.getElementById("promo-discount").value,
    );
    const expires = document.getElementById("promo-expires").value;
    const msg = document.getElementById("promo-create-msg");

    if (!code || !discount || !expires) {
      msg.textContent = "Fill in all fields.";
      msg.style.color = "red";
      return;
    }

    const res = await fetch(`${API}/promotions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promo_code: code,
        discount_percent: discount,
        expiration_date: expires,
      }),
    });

    if (res.ok) {
      msg.style.color = "green";
      msg.textContent = `✓ Promo code "${code}" created!`;
      document.getElementById("promo-code").value = "";
      document.getElementById("promo-discount").value = "";
      document.getElementById("promo-expires").value = "";
      loadPromos();
    } else {
      const err = await res.json();
      msg.style.color = "red";
      msg.textContent = err.detail || "Failed to create promo.";
    }
  });

// Functions for viewing inventory

async function loadInventory() {
  const listEl = document.getElementById("inventory-list");
  try {
    const res = await fetch(`${API}/resources/check-ingredients`);
    const items = await res.json();
    listEl.innerHTML = `
      <table>
        <thead><tr><th>Dish</th><th>Category</th><th>Stock</th><th>Status</th></tr></thead>
        <tbody>
          ${items
            .map(
              (i) => `
            <tr class="${i.sufficient ? "" : "low-stock"}">
              <td>${i.dishes}</td>
              <td>${i.category || "—"}</td>
              <td>${i.resource_amount}</td>
              <td>${i.sufficient ? "✓ In Stock" : "✗ Out of Stock"}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch {
    listEl.innerHTML = "<p class='error'>Failed to load inventory.</p>";
  }
}

// Functions to view top dishes

async function loadTopDishes() {
  const listEl = document.getElementById("top-dishes-list");
  try {
    const res = await fetch(`${API}/reviews/top-dishes`);
    const dishes = await res.json();
    listEl.innerHTML = `
      <table>
        <thead><tr><th>Rank</th><th>Dish</th><th>Category</th><th>Price</th><th>Avg Rating</th><th>Reviews</th></tr></thead>
        <tbody>
          ${dishes
            .map(
              (d, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${d.dishes}</td>
              <td>${d.category || "—"}</td>
              <td>$${d.menu_price.toFixed(2)}</td>
              <td>${d.avg_score ? "★".repeat(Math.round(d.avg_score)) + " " + d.avg_score : "No reviews"}</td>
              <td>${d.review_count}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch {
    listEl.innerHTML = "<p class='error'>Failed to load top dishes.</p>";
  }
}

loadOrders();
loadPromos();
loadInventory();
loadTopDishes();
