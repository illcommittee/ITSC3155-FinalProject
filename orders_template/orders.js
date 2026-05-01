const API = "http://localhost:8000";

function getCustomer() {
  const raw = localStorage.getItem("customer");
  return raw ? JSON.parse(raw) : null;
}

function statusBadge(done) {
  return done
    ? '<span class="badge done">Completed</span>'
    : '<span class="badge pending">Pending</span>';
}

function orderCard(order) {
  return `
    <div class="order-card">
      <div class="order-header">
        <span class="order-num">Order #${order.order_num}</span>
        ${statusBadge(order.order_status)}
        <span class="order-type">${order.order_type}</span>
      </div>
      <p><strong>Customer:</strong> ${order.customer_name}</p>
      <p><strong>Items:</strong> ${order.dish_names || "N/A"}</p>
      <p><strong>Total:</strong> $${order.total_price.toFixed(2)}</p>
      <p><strong>Date:</strong> ${new Date(order.order_date).toLocaleString()}</p>
      <p class="tracking"><strong>Tracking #:</strong> ${order.tracking_num}</p>
    </div>
  `;
}

// Be able to track orders by their order number

document.getElementById("track-btn").addEventListener("click", async () => {
  const num = document.getElementById("track-input").value.trim();
  const resultEl = document.getElementById("track-result");
  if (!num) {
    alert("Enter a tracking number.");
    return;
  }

  try {
    const res = await fetch(`${API}/orders/track/${encodeURIComponent(num)}`);
    if (!res.ok) throw new Error();
    const order = await res.json();
    resultEl.classList.remove("hidden");
    resultEl.innerHTML = orderCard(order);
  } catch {
    resultEl.classList.remove("hidden");
    resultEl.innerHTML =
      '<p class="error">No order found with that tracking number.</p>';
  }
});

// Track by customer's own orders
async function loadMyOrders() {
  const customer = getCustomer();
  const listEl = document.getElementById("my-orders-list");

  if (!customer) return;

  try {
    const res = await fetch(`${API}/orders/`);
    const orders = await res.json();
    const mine = orders.filter((o) => o.customer_id === customer.id);

    if (!mine.length) {
      listEl.innerHTML = "<p class='muted'>You have no orders yet.</p>";
      return;
    }
    listEl.innerHTML = mine.map(orderCard).join("");
  } catch {
    listEl.innerHTML = "<p class='error'>Could not load orders.</p>";
  }
}

function updateAuthLink() {
  const customer = getCustomer();
  const link = document.getElementById("auth-link");
  if (customer) {
    link.textContent = `Hi, ${customer.customer_name.split(" ")[0]}`;
    link.href = "#";

    const section = document.getElementById("my-orders-section");
    section.querySelector("h2").textContent =
      `${customer.customer_name}'s Orders`;
  }
}

updateAuthLink();
loadMyOrders();
