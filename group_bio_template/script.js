let order = [];


menu.forEach(item => {
  const btn = document.createElement("button");
  btn.textContent = `${item.name} $${item.price}`;
  btn.onclick = () => addItem(item);
  document.getElementById("menu").appendChild(btn);
});

function addItem(item) {
  const found = order.find(i => i.id === item.id);
  if (found) found.qty++;
  else order.push({ ...item, qty: 1 });
  renderOrder();
}

function renderOrder() {
  const list = document.getElementById("order-list");
  list.innerHTML = "";
  let total = 0;
  order.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} x${item.qty}`;
    list.appendChild(li);
    total += item.price * item.qty;
  });
  document.getElementById("total").textContent = `Total: $${total.toFixed(2)}`;
}

async function placeOrder() {
  const type = document.querySelector('input[name="type"]:checked').value;
  const promo = document.getElementById("promo").value;

  const res = await fetch("http://localhost:5000/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: order, type, promo })
  });

  const data = await res.json();
  document.getElementById("msg").textContent = `Order #${data.orderId} placed!`;
  order = [];
  renderOrder();
}