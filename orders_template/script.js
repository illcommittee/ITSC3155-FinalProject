const API_URL = "http://127.0.0.1:8000";

/**
 * Toggles the display of an order information panel.
 * This keeps the same show/hide behavior that was used in the original page.
 *
 * @param {string} panelId - The ID of the panel to show or hide.
 */
function toggleSection(panelId) {
  const panel = document.getElementById(panelId);

  if (panel.style.display === "none" || panel.style.display === "") {
    panel.style.display = "block";
  } else {
    panel.style.display = "none";
  }
}

/**
 * Gets all orders from the backend API and displays them on the page.
 * This is used by the staff/demo view to quickly verify order records.
 */
async function allOrders() {
  const ordersContainer = document.getElementById("all-orders");
  ordersContainer.textContent = "Loading orders...";

  try {
    const response = await fetch(`${API_URL}/orders/`);

    if (!response.ok) {
      throw new Error(`Could not load orders. Status: ${response.status}`);
    }

    const allOrderInfo = await response.json();

    if (allOrderInfo.length === 0) {
      ordersContainer.textContent = "No orders to display.";
      return;
    }

    ordersContainer.innerHTML = "";

    allOrderInfo.forEach(order => {
      const orderCard = document.createElement("div");
      orderCard.className = "order-record";

      orderCard.innerHTML = `
        <h3>Order #${order.order_num}</h3>
        <p><strong>Customer:</strong> ${order.customer_name}</p>
        <p><strong>Tracking Number:</strong> ${order.tracking_num}</p>
        <p><strong>Status:</strong> ${order.order_status ? "Completed" : "In Progress"}</p>
        <p><strong>Order Type:</strong> ${order.order_type}</p>
        <p><strong>Details:</strong> ${order.order_details || "No details listed"}</p>
        <p><strong>Total:</strong> $${Number(order.total_price).toFixed(2)}</p>
        <p><strong>Date:</strong> ${order.order_date}</p>
      `;

      ordersContainer.appendChild(orderCard);
    });
  } catch (error) {
    console.error("Error loading orders:", error);
    ordersContainer.textContent = "Unable to load orders. Make sure the API is running.";
  }
}

/**
 * Uses the tracking number endpoint to find a specific order.
 * Customers can use this to check the status and details of their order.
 */
async function trackOrder() {
  const trackingInput = document.getElementById("tracking-input");
  const trackingResult = document.getElementById("tracking-result");
  const trackingNumber = trackingInput.value.trim();

  document.getElementById("tracking-panel").style.display = "block";

  if (!trackingNumber) {
    trackingResult.textContent = "Please enter a tracking number.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/orders/tracking/${trackingNumber}`);

    if (!response.ok) {
      throw new Error("Tracking number not found.");
    }

    const order = await response.json();

    trackingResult.textContent =
      `Order #${order.order_num}\n` +
      `Customer: ${order.customer_name}\n` +
      `Tracking Number: ${order.tracking_num}\n` +
      `Status: ${order.order_status ? "Completed" : "In Progress"}\n` +
      `Order Type: ${order.order_type}\n` +
      `Details: ${order.order_details || "No details listed"}\n` +
      `Total: $${Number(order.total_price).toFixed(2)}\n` +
      `Date: ${order.order_date}`;
  } catch (error) {
    console.error("Error tracking order:", error);
    trackingResult.textContent = "Order not found. Please check the tracking number.";
  }
}

/**
 * Gets revenue totals for a selected date.
 * This supports the staff question about viewing sales over a specific day.
 */
async function getRevenue() {
  const dateInput = document.getElementById("revenue-date");
  const revenueResult = document.getElementById("revenue-result");
  const selectedDate = dateInput.value;

  document.getElementById("revenue-panel").style.display = "block";

  if (!selectedDate) {
    revenueResult.textContent = "Please select a date.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/orders/revenue/?target_date=${selectedDate}`);

    if (!response.ok) {
      throw new Error(`Could not load revenue. Status: ${response.status}`);
    }

    const revenueInfo = await response.json();

    revenueResult.textContent =
      `Date: ${revenueInfo.date}\n` +
      `Revenue: $${Number(revenueInfo.revenue).toFixed(2)}\n` +
      `Order Count: ${revenueInfo.order_count}`;
  } catch (error) {
    console.error("Error loading revenue:", error);
    revenueResult.textContent = "Unable to load revenue. Make sure the API is running.";
  }
}