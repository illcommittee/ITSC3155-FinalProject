const API_URL = "http://127.0.0.1:8000";

document
  .getElementById("signup-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const customerData = {
      order_num: 0,
      customer_name: document.getElementById("customer-name").value,
      email: document.getElementById("signup-email").value,
      phone_num: Number(document.getElementById("phone-num").value),
      address: document.getElementById("address").value,
    };

    const response = await fetch(`${API_URL}/customer/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    });

    if (response.ok) {
      alert("Account created!");
    } else {
      alert("Could not create account.");
    }
  });

document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value;

    const response = await fetch(`${API_URL}/customer/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    if (response.ok) {
      const customer = await response.json();

      localStorage.setItem("customer", JSON.stringify(customer));

      alert("Login successful!");
      window.location.href = "../menu_template/menu.html";
    } else {
      alert("No account found with that email.");
    }
  });
