/*
  EDIT PRODUCTS HERE.
  Keep each product's id unique. Prices are numbers, e.g. 25.00.
*/
const PRODUCTS = [
  {
    id: "product-1",
    name: "ALCarnitor [750mg/mL]",
    description: "Add your product description here.",
    price: 36,
    image: ""
  },
  {
    id: "product-2",
    name: "Diisopropylamine Dichloroacetate [300mg/mL]",
    description: "Add your product description here.",
    price: 42,
    image: ""
  },
  {
    id: "product-3",
    name: "Super Shredder [455mg/mL]",
    description: "Add your product description here.",
    price: 25,
    image: ""
  },
  {
    id: "product-4",
    name: "Temporary Insanity [295mg/mL]",
    description: "Add your product description here.",
    price: 27,
    image: ""
  }
  },
  {
    id: "product-5",
    name: "NAD+ [150mg/mL]",
    description: "Add your product description here.",
    price: 33,
    image: ""
  }
  },
  {
    id: "product-6",
    name: "Glutathione [300mg/mL]",
    description: "Add your product description here.",
    price: 36,
    image: ""
  }
  },
  {
    id: "product-7",
    name: "Bacteriostatic Water [0.9%]",
    description: "Add your product description here.",
    price: 12,
    image: ""
  }
  },
  {
    id: "product-8",
    name: "Methylcobalamin [10mg/mL]",
    description: "Add your product description here.",
    price: 35,
    image: ""
  }
  },
  {
    id: "product-9",
    name: "Yohimbine V2 [7mg/mL]",
    description: "Add your product description here.",
    price: 35,
    image: ""
  }
];

// Replace this with the business email that should receive orders.
const ORDER_EMAIL = "orders@yourbusiness.com";

const cart = new Map();

const productGrid = document.querySelector("#productGrid");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const cartCount = document.querySelector("#cartCount");
const cartButton = document.querySelector("#cartButton");
const cartSection = document.querySelector("#cartSection");
const clearCart = document.querySelector("#clearCart");
const orderForm = document.querySelector("#orderForm");
const formStatus = document.querySelector("#formStatus");

const money = value => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
}).format(value);

function renderProducts() {
  productGrid.innerHTML = PRODUCTS.map(product => {
    const image = product.image
      ? `<img src="${escapeHtml(product.image)}" alt="" loading="lazy">`
      : `<span>IMAGE</span>`;

    return `
      <article class="product-card">
        <div class="product-image">${image}</div>
        <div class="product-info">
          <h3>${escapeHtml(product.name)}</h3>
          <p class="product-description">${escapeHtml(product.description)}</p>
          <div class="product-bottom">
            <span class="price">${money(product.price)}</span>
            <button class="secondary-button" type="button" data-add="${product.id}">Add</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderCart() {
  const entries = [...cart.entries()];

  if (!entries.length) {
    cartItems.innerHTML = '<p class="empty-state">Your cart is empty.</p>';
  } else {
    cartItems.innerHTML = entries.map(([id, quantity]) => {
      const product = PRODUCTS.find(p => p.id === id);
      const subtotal = product.price * quantity;

      return `
        <div class="cart-row">
          <div class="cart-name">${escapeHtml(product.name)}</div>
          <div class="quantity">
            <button type="button" data-change="${id}" data-delta="-1" aria-label="Decrease quantity">−</button>
            <strong>${quantity}</strong>
            <button type="button" data-change="${id}" data-delta="1" aria-label="Increase quantity">+</button>
          </div>
          <strong>${money(subtotal)}</strong>
          <button class="remove-button" type="button" data-remove="${id}">Remove</button>
        </div>
      `;
    }).join("");
  }

  const total = entries.reduce((sum, [id, quantity]) => {
    const product = PRODUCTS.find(p => p.id === id);
    return sum + product.price * quantity;
  }, 0);

  const count = entries.reduce((sum, [, quantity]) => sum + quantity, 0);

  cartTotal.textContent = money(total);
  cartCount.textContent = count;
}

function addToCart(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
}

function changeQuantity(id, delta) {
  const next = (cart.get(id) || 0) + delta;
  if (next <= 0) cart.delete(id);
  else cart.set(id, next);
  renderCart();
}

function removeFromCart(id) {
  cart.delete(id);
  renderCart();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});

cartItems.addEventListener("click", event => {
  const change = event.target.closest("[data-change]");
  if (change) {
    changeQuantity(change.dataset.change, Number(change.dataset.delta));
    return;
  }

  const remove = event.target.closest("[data-remove]");
  if (remove) removeFromCart(remove.dataset.remove);
});

cartButton.addEventListener("click", () => {
  cartSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

clearCart.addEventListener("click", () => {
  cart.clear();
  renderCart();
  formStatus.textContent = "";
});

orderForm.addEventListener("submit", event => {
  event.preventDefault();
  formStatus.textContent = "";

  if (!cart.size) {
    formStatus.textContent = "Add at least one product before generating an order.";
    cartSection.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const name = document.querySelector("#customerName").value.trim();
  const email = document.querySelector("#customerEmail").value.trim();
  const payment = document.querySelector("#paymentMethod").value;
  const message = document.querySelector("#customerMessage").value.trim();

  const lines = [...cart.entries()].map(([id, quantity]) => {
    const product = PRODUCTS.find(p => p.id === id);
    return `- ${product.name} × ${quantity} = ${money(product.price * quantity)}`;
  });

  const total = [...cart.entries()].reduce((sum, [id, quantity]) => {
    const product = PRODUCTS.find(p => p.id === id);
    return sum + product.price * quantity;
  }, 0);

  const subject = `New order from ${name}`;
  const body = [
    "NEW ORDER",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Payment method: ${payment}`,
    "",
    "Items:",
    ...lines,
    "",
    `Total: ${money(total)}`,
    "",
    "Message:",
    message || "(none)"
  ].join("\n");

  window.location.href =
    `mailto:${encodeURIComponent(ORDER_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  formStatus.textContent = "Your email app should open with the order filled in. Review it and send it.";
});

document.querySelector("#year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
