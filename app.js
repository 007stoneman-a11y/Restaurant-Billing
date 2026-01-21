const STORAGE_KEYS = {
  menu: "restaurant_menu",
  cart: "restaurant_cart",
};

const TAX_RATE = 0.05;
const DEMO_PAYMENT_URL = "https://example.com/pay";
const PLACEHOLDER_IMG = "assets/placeholder.svg";
const DEMO_QR_DATA_URI =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" fill="%23fff"/><rect x="2" y="2" width="24" height="24" fill="%23000"/><rect x="8" y="8" width="12" height="12" fill="%23fff"/><rect x="94" y="2" width="24" height="24" fill="%23000"/><rect x="100" y="8" width="12" height="12" fill="%23fff"/><rect x="2" y="94" width="24" height="24" fill="%23000"/><rect x="8" y="100" width="12" height="12" fill="%23fff"/><rect x="36" y="36" width="12" height="12" fill="%23000"/><rect x="52" y="36" width="8" height="8" fill="%23000"/><rect x="72" y="36" width="10" height="10" fill="%23000"/><rect x="36" y="56" width="14" height="14" fill="%23000"/><rect x="56" y="56" width="10" height="10" fill="%23000"/><rect x="74" y="56" width="14" height="14" fill="%23000"/><rect x="36" y="78" width="8" height="8" fill="%23000"/><rect x="50" y="78" width="10" height="10" fill="%23000"/><rect x="70" y="78" width="16" height="16" fill="%23000"/><text x="60" y="114" text-anchor="middle" fill="%23000" font-family="Arial" font-size="10">Demo QR</text></svg>';

const seedItems = [
  { id: crypto.randomUUID(), name: "Idly", price: 30, image: PLACEHOLDER_IMG },
  { id: crypto.randomUUID(), name: "Dosa", price: 50, image: PLACEHOLDER_IMG },
  { id: crypto.randomUUID(), name: "Vada", price: 25, image: PLACEHOLDER_IMG },
  { id: crypto.randomUUID(), name: "Poori", price: 45, image: PLACEHOLDER_IMG },
  { id: crypto.randomUUID(), name: "Pongal", price: 40, image: PLACEHOLDER_IMG },
];

let menu = [];
let cart = {};

const menuGrid = document.getElementById("menu-grid");
const cartEl = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const totalEl = document.getElementById("total");
const form = document.getElementById("item-form");
const idInput = document.getElementById("item-id");
const nameInput = document.getElementById("item-name");
const priceInput = document.getElementById("item-price");
const imageInput = document.getElementById("item-image");
const resetBtn = document.getElementById("reset-btn");
const saveBtn = document.getElementById("save-btn");
const payBtn = document.getElementById("pay-now");
const qrModal = document.getElementById("qr-modal");
const qrImage = document.getElementById("qr-image");
const closeModalBtn = document.getElementById("close-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");

function loadState() {
  const storedMenu = localStorage.getItem(STORAGE_KEYS.menu);
  const storedCart = localStorage.getItem(STORAGE_KEYS.cart);
  menu = storedMenu ? JSON.parse(storedMenu) : seedItems;
  cart = storedCart ? JSON.parse(storedCart) : {};
  persistMenu();
  persistCart();
}

function persistMenu() {
  localStorage.setItem(STORAGE_KEYS.menu, JSON.stringify(menu));
}

function persistCart() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
}

function renderMenu() {
  menuGrid.innerHTML = "";
  menu.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image || PLACEHOLDER_IMG}" alt="${item.name}" onerror="this.src='${PLACEHOLDER_IMG}'">
      <div>
        <h4>${item.name}</h4>
        <div class="price">₹${Number(item.price).toFixed(2)}</div>
      </div>
      <div class="actions">
        <button class="btn primary small" data-add="${item.id}">Add</button>
        <button class="btn ghost small" data-edit="${item.id}">Edit</button>
        <button class="btn ghost small" data-delete="${item.id}">Delete</button>
      </div>
    `;
    menuGrid.appendChild(card);
  });
}

function renderCart() {
  const entries = Object.entries(cart);
  cartEl.innerHTML = "";
  if (entries.length === 0) {
    cartEl.classList.add("empty-state");
    cartEl.textContent = "Cart is empty";
  } else {
    cartEl.classList.remove("empty-state");
    entries.forEach(([id, entry]) => {
      const row = document.createElement("div");
      row.className = "cart-line";
      row.innerHTML = `
        <div>${entry.name}</div>
        <div>₹${Number(entry.price).toFixed(2)}</div>
        <div class="qty">
          <button class="btn ghost small" data-dec="${id}">-</button>
          <span>${entry.qty}</span>
          <button class="btn ghost small" data-inc="${id}">+</button>
        </div>
        <button class="btn ghost small" data-remove="${id}">x</button>
      `;
      cartEl.appendChild(row);
    });
  }
  updateTotals();
}

function updateTotals() {
  const subtotal = Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  taxEl.textContent = `₹${tax.toFixed(2)}`;
  totalEl.textContent = `₹${total.toFixed(2)}`;
}

function addToCart(id) {
  const item = menu.find((m) => m.id === id);
  if (!item) return;
  if (!cart[id]) {
    cart[id] = { ...item, qty: 1 };
  } else {
    cart[id].qty += 1;
  }
  persistCart();
  renderCart();
}

function editItem(id) {
  const item = menu.find((m) => m.id === id);
  if (!item) return;
  idInput.value = item.id;
  nameInput.value = item.name;
  priceInput.value = item.price;
  imageInput.value = item.image || "";
  saveBtn.textContent = "Update Item";
}

function deleteItem(id) {
  menu = menu.filter((m) => m.id !== id);
  delete cart[id];
  persistMenu();
  persistCart();
  renderMenu();
  renderCart();
  resetForm();
}

function resetForm() {
  idInput.value = "";
  nameInput.value = "";
  priceInput.value = "";
  imageInput.value = "";
  saveBtn.textContent = "Save Item";
}

function handleMenuClick(e) {
  const { add, edit, delete: del } = e.target.dataset;
  if (add) addToCart(add);
  if (edit) editItem(edit);
  if (del) deleteItem(del);
}

function handleCartClick(e) {
  const { inc, dec, remove } = e.target.dataset;
  if (inc) {
    cart[inc].qty += 1;
  }
  if (dec) {
    cart[dec].qty = Math.max(1, cart[dec].qty - 1);
  }
  if (remove) {
    delete cart[remove];
  }
  persistCart();
  renderCart();
}

function handleSubmit(e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  const price = Number(priceInput.value);
  const image = imageInput.value.trim() || PLACEHOLDER_IMG;
  if (!name || price <= 0) return;

  const existingId = idInput.value;
  if (existingId) {
    menu = menu.map((m) => (m.id === existingId ? { ...m, name, price, image } : m));
  } else {
    menu.push({ id: crypto.randomUUID(), name, price, image });
  }
  persistMenu();
  renderMenu();
  resetForm();
}

function setupQR() {
  qrImage.src = DEMO_QR_DATA_URI;
  payBtn.addEventListener("click", () => {
    qrModal.classList.remove("hidden");
  });
  const close = () => qrModal.classList.add("hidden");
  closeModalBtn.addEventListener("click", close);
  modalCloseBtn.addEventListener("click", close);
  qrModal.addEventListener("click", (e) => {
    if (e.target === qrModal) close();
  });
}

function init() {
  loadState();
  renderMenu();
  renderCart();
  menuGrid.addEventListener("click", handleMenuClick);
  cartEl.addEventListener("click", handleCartClick);
  form.addEventListener("submit", handleSubmit);
  resetBtn.addEventListener("click", resetForm);
  setupQR();
}

document.addEventListener("DOMContentLoaded", init);
