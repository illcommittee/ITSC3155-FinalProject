const API_URL = "http://127.0.0.1:8000";
const savedUser = JSON.parse(localStorage.getItem("customer"));

if (savedUser) {
  showLoggedIn(savedUser);
}


function showLoggedIn(user) {
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "none";

  document.getElementById("logged-in-section").style.display = "block";
  document.getElementById("welcome-msg").textContent =
    "Welcome, " + user.customer_name + "!";
}

document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    customer_name: document.getElementById("customer-name").value,
    email: document.getElementById("signup-email").value,
    phone_num: Number(document.getElementById("phone-num").value),
    address: document.getElementById("address").value,
    order_num: 0,
  };

  const res = await fetch(`${API_URL}/customer/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  alert(res.ok ? "Account created!" : "Signup failed.");
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;

  const res = await fetch(`${API_URL}/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (res.ok) {
    const user = await res.json();
    localStorage.setItem("customer", JSON.stringify(user));

    showLoggedIn(user);
    setTimeout(() => {
      window.location.href = "../menu_template/menu.html";
    }, 500);
  } else {
    alert("Login failed.");
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("customer");
  location.reload();
});
