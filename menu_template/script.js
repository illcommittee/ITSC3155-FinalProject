// Menu page logic for the restaurant ordering demo.
// Loads menu items from the FastAPI backend, lets users add items to an order,
// applies promo codes, and submits orders/payments to the API.
// Supports rating and reviewing dishes the logged-in customer has ordered.

const API_BASE = "http://127.0.0.1:8000";

let menuItems = [];
let orderItems = [];
let discount = 0;
let appliedPromoCode = null;

// Tracks which resource IDs the logged-in customer has previously ordered.
let orderedItemIds = new Set();
// Maps resource_id -> { avg_score, review_count } from the top-dishes endpoint.
let ratingsMap = {};

const customer = JSON.parse(localStorage.getItem("customer") || "null");

if (customer?.is_staff) {
  document.getElementById("staff-nav-item").style.display = "";
}

// State for the currently open review modal.
let activeReview = null; // { resourceId, existingReviewId | null }

// ── Menu loading ────────────────────────────────────────────────────────────

async function loadMenu() {
  const message = document.getElementById("menu-message");

  try {
    const [ratingsRes, menuRes] = await Promise.all([
      fetch(`${API_BASE}/reviews/top-dishes`),
      fetch(`${API_BASE}/resources/`),
    ]);

    if (ratingsRes.ok) {
      const ratings = await ratingsRes.json();
      ratings.forEach(r => {
        ratingsMap[r.id] = { avg_score: r.avg_score, review_count: r.review_count };
      });
    }

    if (!menuRes.ok) throw new Error(`Menu request failed with status ${menuRes.status}`);

    menuItems = await menuRes.json();

    if (!menuItems.length) {
      message.textContent = "No menu items found. Run python seed.py first.";
      return;
    }

    if (customer) {
      await loadCustomerOrders();
    }

    renderCategoryFilter(menuItems);
    renderMenu(menuItems);
  } catch (err) {
    console.error("Failed to load menu:", err);
    message.textContent = "Failed to load menu. Make sure the API is running.";
  }
}

// Fetch this customer's past orders and build the set of ordered resource IDs
// by matching dish names in order_details against the loaded menu items.
async function loadCustomerOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders/customer/${customer.id}`);
    if (!res.ok) return;
    const orders = await res.json();

    orders.forEach(order => {
      if (!order.order_details) return;
      // order_details format: "Chicken Sandwich x1, Veggie Wrap x2"
      order.order_details.split(", ").forEach(part => {
        const dishName = part.replace(/ x\d+$/, "").trim();
        const menuItem = menuItems.find(item => item.dishes === dishName);
        if (menuItem) orderedItemIds.add(menuItem.id);
      });
    });
  } catch (err) {
    console.error("Failed to load customer orders:", err);
  }
}

// ── Rendering helpers ────────────────────────────────────────────────────────

function renderStars(score) {
  if (score == null) return '<span class="no-rating">No ratings yet</span>';
  const full = Math.round(score);
  let html = '<span class="stars" aria-label="Rating: ' + score.toFixed(1) + ' out of 5">';
  for (let i = 1; i <= 5; i++) {
    html += i <= full ? "★" : "☆";
  }
  html += `</span> <span class="rating-score">${score.toFixed(1)}</span>`;
  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCategoryFilter(items) {
  const categories = ["All", ...new Set(items.map(item => item.category).filter(Boolean))];
  const tabContainer = document.getElementById("category-tabs");
  tabContainer.innerHTML = "";

  categories.forEach(category => {
    const button = document.createElement("button");
    button.className = "tab-btn";
    button.textContent = category;

    if (category === "All") button.classList.add("active");

    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      renderMenu(category === "All" ? items : items.filter(item => item.category === category));
    });

    tabContainer.appendChild(button);
  });
}

function renderMenu(items) {
  const grid = document.getElementById("menu-grid");
  grid.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "menu-card";

    const ratingInfo = ratingsMap[item.id];
    const reviewCount = ratingInfo?.review_count ?? 0;
    const canReview = customer && orderedItemIds.has(item.id);

    card.innerHTML = `
      <h3>${escapeHtml(item.dishes)}</h3>
      <p class="price">$${Number(item.menu_price).toFixed(2)}</p>
      <div class="rating-display">
        ${renderStars(ratingInfo?.avg_score ?? null)}
        ${reviewCount > 0
          ? `<span class="review-count review-count-link">(${reviewCount} ${reviewCount === 1 ? "review" : "reviews"})</span>`
          : `<span class="review-count">(0 reviews)</span>`}
      </div>
      <p class="info">${item.calories} cal</p>
      <p class="info">Category: ${escapeHtml(item.category)}</p>
      <p class="info">Ingredients: ${escapeHtml(item.ingredients)}</p>
      <p class="info">Allergens: ${escapeHtml(item.allergens || "None")}</p>
      <button type="button" class="add-btn">Add</button>
      ${canReview ? `<button type="button" class="review-btn">Write a Review</button>` : ""}
    `;

    card.querySelector(".add-btn").addEventListener("click", () => addToOrder(item));

    const reviewCountLink = card.querySelector(".review-count-link");
    if (reviewCountLink) {
      reviewCountLink.addEventListener("click", () => openViewReviewsModal(item.id, item.dishes));
    }

    const reviewBtn = card.querySelector(".review-btn");
    if (reviewBtn) {
      reviewBtn.addEventListener("click", () => openReviewModal(item.id, item.dishes));
    }

    grid.appendChild(card);
  });
}

// ── Order management ─────────────────────────────────────────────────────────

function addToOrder(item) {
  const existing = orderItems.find(orderItem => orderItem.id === item.id);

  if (existing) {
    existing.qty += 1;
  } else {
    orderItems.push({ ...item, qty: 1 });
  }

  renderOrder();
}

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

function showCheckout() {
  if (!orderItems.length) {
    alert("Add items first.");
    return;
  }

  document.getElementById("checkout-section").classList.remove("hidden");
  updateCheckoutTotal();
}

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

    if (!res.ok) throw new Error("Invalid promo code");

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

  const customerId = customer ? customer.id : 1;

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

    // Add newly ordered items to the customer's reviewable set.
    orderItems.forEach(item => orderedItemIds.add(item.id));

    finishOrder(order.tracking_num, total);
  } catch (err) {
    console.error("Order failed:", err);
    alert("Order failed. Check that the API is running and seeded.");
  }
}

function finishOrder(trackingNumber, total) {
  document.getElementById("order-status").textContent =
    `Order placed! Tracking: ${trackingNumber}. Charged: $${total.toFixed(2)}. You can now review the items you ordered.`;

  orderItems = [];
  discount = 0;
  appliedPromoCode = null;

  renderOrder();
  updateCheckoutTotal();

  document.getElementById("promo").value = "";
  document.getElementById("promo-msg").textContent = "";
  document.getElementById("checkout-section").classList.add("hidden");

  // Re-render the menu so "Write a Review" buttons appear on newly ordered items.
  const activeCategory = document.querySelector(".tab-btn.active")?.textContent ?? "All";
  const filtered = activeCategory === "All"
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);
  renderMenu(filtered);
}

// ── Review modal ─────────────────────────────────────────────────────────────

async function openReviewModal(resourceId, dishName) {
  activeReview = { resourceId, existingReviewId: null };

  document.getElementById("review-modal-title").textContent = `Review: ${dishName}`;
  document.getElementById("review-text").value = "";
  document.getElementById("review-msg").textContent = "";
  setSelectedStar(0);
  document.getElementById("review-submit-btn").textContent = "Submit Review";

  // Pre-fill if the customer already submitted a review for this dish.
  try {
    const res = await fetch(`${API_BASE}/reviews/customer/${customer.id}/resource/${resourceId}`);
    if (res.ok) {
      const existing = await res.json();
      if (existing) {
        activeReview.existingReviewId = existing.id;
        document.getElementById("review-text").value = existing.review_txt;
        setSelectedStar(existing.score);
        document.getElementById("review-submit-btn").textContent = "Update Review";
      }
    }
  } catch (err) {
    console.error("Could not fetch existing review:", err);
  }

  document.getElementById("review-modal").showModal();
}

function setSelectedStar(score) {
  document.querySelectorAll(".star-btn").forEach((btn, idx) => {
    btn.classList.toggle("selected", idx < score);
  });
  document.getElementById("review-modal").dataset.score = score;
}

async function submitReview() {
  const score = parseInt(document.getElementById("review-modal").dataset.score || "0");
  const reviewTxt = document.getElementById("review-text").value.trim();
  const msgEl = document.getElementById("review-msg");

  if (!score) {
    msgEl.textContent = "Please select a star rating.";
    return;
  }
  if (!reviewTxt) {
    msgEl.textContent = "Please write a review.";
    return;
  }

  const payload = {
    customer_id: customer.id,
    resource_id: activeReview.resourceId,
    review_txt: reviewTxt,
    score,
  };

  try {
    let res;
    if (activeReview.existingReviewId) {
      res = await fetch(`${API_BASE}/reviews/${activeReview.existingReviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`${API_BASE}/reviews/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) throw new Error(await res.text());

    msgEl.textContent = "Review saved!";

    await refreshRatings();

    setTimeout(() => {
      document.getElementById("review-modal").close();
      const activeCategory = document.querySelector(".tab-btn.active")?.textContent ?? "All";
      const filtered = activeCategory === "All"
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory);
      renderMenu(filtered);
    }, 800);
  } catch (err) {
    console.error("Review submission failed:", err);
    msgEl.textContent = "Failed to save review. Please try again.";
  }
}

async function refreshRatings() {
  try {
    const res = await fetch(`${API_BASE}/reviews/top-dishes`);
    if (!res.ok) return;
    const ratings = await res.json();
    ratingsMap = {};
    ratings.forEach(r => {
      ratingsMap[r.id] = { avg_score: r.avg_score, review_count: r.review_count };
    });
  } catch (err) {
    console.error("Failed to refresh ratings:", err);
  }
}

// ── View reviews modal ────────────────────────────────────────────────────────

async function openViewReviewsModal(resourceId, dishName) {
  document.getElementById("view-reviews-title").textContent = `Reviews: ${dishName}`;
  const listEl = document.getElementById("reviews-list");
  const loadingEl = document.getElementById("reviews-loading");

  listEl.innerHTML = "";
  loadingEl.textContent = "Loading reviews...";

  document.getElementById("view-reviews-modal").showModal();

  try {
    const res = await fetch(`${API_BASE}/reviews/?resource_id=${resourceId}`);
    if (!res.ok) throw new Error("Failed to load reviews");
    const reviews = await res.json();

    loadingEl.textContent = "";

    if (!reviews.length) {
      listEl.innerHTML = '<p class="no-reviews-msg">No reviews yet.</p>';
      return;
    }

    listEl.innerHTML = reviews.map(r => `
      <div class="review-item">
        <div class="review-item-stars">${renderStars(r.score)}</div>
        <p class="review-item-text">${escapeHtml(r.review_txt)}</p>
      </div>
    `).join("");
  } catch (err) {
    console.error("Failed to load reviews:", err);
    loadingEl.textContent = "Failed to load reviews. Please try again.";
  }
}

// ── Event listeners ───────────────────────────────────────────────────────────

document.getElementById("checkout-btn").addEventListener("click", showCheckout);
document.getElementById("apply-promo").addEventListener("click", applyPromo);
document.getElementById("pay-btn").addEventListener("click", placeOrder);

document.getElementById("review-submit-btn").addEventListener("click", submitReview);
document.getElementById("review-cancel-btn").addEventListener("click", () => {
  document.getElementById("review-modal").close();
});

document.getElementById("view-reviews-close-btn").addEventListener("click", () => {
  document.getElementById("view-reviews-modal").close();
});

// Interactive star hover/click in the review modal.
document.querySelectorAll(".star-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    setSelectedStar(parseInt(btn.dataset.star));
  });

  btn.addEventListener("mouseenter", () => {
    const hover = parseInt(btn.dataset.star);
    document.querySelectorAll(".star-btn").forEach((b, idx) => {
      b.classList.toggle("hovered", idx < hover);
    });
  });

  btn.addEventListener("mouseleave", () => {
    document.querySelectorAll(".star-btn").forEach(b => b.classList.remove("hovered"));
  });
});

loadMenu();
