// Login/signup page logic.
// Creates customer accounts, logs customers in, and stores the active customer
// in localStorage so the menu page can connect orders to a customer.

const API_URL = "http://127.0.0.1:8000";

// If a customer was already saved in the browser, keep them logged in.
const savedUser = JSON.parse(localStorage.getItem("customer"));

if (savedUser) {
  showLoggedIn(savedUser);
}

// Hide the account forms and show the logged-in customer message.
function showLoggedIn(user) {
  document.getElementById("signup-section").style.display = "none";
  document.getElementById("login-section").style.display = "none";

  document.getElementById("logged-in-section").style.display = "block";
  document.getElementById("welcome-msg").textContent =
    "Welcome, " + user.customer_name + "!";
}

// Create a customer account using the backend /customer/ endpoint.
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    order_num: 0,
    customer_name: document.getElementById("customer-name").value.trim(),
    email: document.getElementById("signup-email").value.trim(),
    phone_num: document.getElementById("phone-num").value.trim(),
    address: document.getElementById("address").value.trim(),
    password: document.getElementById("signup-password").value,
  };

  try {
    const res = await fetch(`${API_URL}/customer/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    const user = await res.json();
    localStorage.setItem("customer", JSON.stringify(user));

    document.getElementById("signup-msg").textContent = "Account created successfully.";
    showLoggedIn(user);

    setTimeout(() => {
      window.location.href = "../menu_template/menu.html";
    }, 700);
  } catch (error) {
    console.error("Signup failed:", error);
    document.getElementById("signup-msg").textContent =
      "Signup failed. Check that the API is running.";
  }
});

// Log in using the backend /customer/login endpoint.
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch(`${API_URL}/customer/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    const user = await res.json();
    localStorage.setItem("customer", JSON.stringify(user));

    document.getElementById("login-msg").textContent = "Login successful.";
    showLoggedIn(user);

    setTimeout(() => {
      window.location.href = "../menu_template/menu.html";
    }, 700);
  } catch (error) {
    console.error("Login failed:", error);
    document.getElementById("login-msg").textContent =
      "Login failed. Check your email and password.";
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("customer");
  location.reload();
});