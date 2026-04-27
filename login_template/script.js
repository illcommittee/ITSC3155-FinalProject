const API_URL = "http://127.0.0.1:8000";

const message = document.getElementById("message");

// Create account
document
  .getElementById("signup-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not create account");
      }

      message.textContent = "Account created successfully!";
    } catch (error) {
      message.textContent = "Error creating account.";
      console.error(error);
    }
  });

// Login
document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid login");
      }

      const data = await response.json();

      message.textContent = "Login successful!";

      // Save user info or token if your API returns one
      localStorage.setItem("user", JSON.stringify(data));

      // Redirect after login
      window.location.href = "index.html";
    } catch (error) {
      message.textContent = "Invalid username or password.";
      console.error(error);
    }
  });
