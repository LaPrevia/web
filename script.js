// script.js - Carrito dinámico completo (reemplazar archivo actual)
// ---------------------------------------------------------------

const CART_KEY = "catalogo_cart_v2";
const PHONE_NUMBER = "5492241603438"; // <- REEMPLAZÁ con el número real

// Estado del carrito (carga desde localStorage)
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

// Elementos del DOM esperados
const cartToggle = document.getElementById("cart-toggle");
const cartPanel = document.getElementById("cart-panel");
const closeCartBtn = document.getElementById("close-cart");
const cartCountEl = document.getElementById("cart-count");
const cartItemsList = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const whatsappBtn = document.getElementById("whatsapp-btn");

// ----------------- Utilities -----------------
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatCurrency(n) {
  // Asume pesos. Devuelve con separador de miles, sin decimales.
  return new Intl.NumberFormat("es-AR").format(n ? n : 0);
}

// Extrae número entero desde strings tipo "$14.500" o "$ 8.500"
function parsePrice(text) {
  if (!text) return 0;
  // Quitar todo lo que no sea dígito
  const digits = text.replace(/\D+/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

// Genera id a partir del nombre (slug) si no hay data-id
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .slice(0, 60);
}

// ----------------- Operaciones del carrito -----------------
function findItem(id) {
  return cart.find((x) => x.id === id);
}

function addToCart(item) {
  // item { id, name, price, qty }
  const existing = findItem(item.id);
  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push({ ...item });
  }
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const it = findItem(id);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) {
    cart = cart.filter((x) => x.id !== id);
  }
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter((x) => x.id !== id);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

// ----------------- Render del carrito -----------------
function renderCart() {
  // Actualizar contador
  const totalCount = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = totalCount;

  // Render items
  cartItemsList.innerHTML = "";
  let subtotal = 0;

  if (cart.length === 0) {
    const li = document.createElement("li");
    li.className = "cart-item empty";
    li.innerHTML = `
      <div class="item-empty">
        <div class="item-name">Carrito vacío</div>
        <div class="item-meta">Agregá productos para hacer un pedido</div>
      </div>
    `;
    cartItemsList.appendChild(li);
  } else {
    cart.forEach((it) => {
      const itemSubtotal = it.price * it.qty;
      subtotal += itemSubtotal;

      const li = document.createElement("li");
      li.className = "cart-item";

      // Íconos SVG (inline) — simples y nítidos para mobile
      const plusSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      const minusSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      const trashSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="#d32f2f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

      // Estructura: thumb | detalles | acciones
      li.innerHTML = `
        <div class="cart-thumb-wrap">
          <img src="${it.image || ''}" class="cart-thumb" alt="${it.name}">
        </div>

        <div class="cart-details">
          <div class="item-name">${it.name}</div>
          <div class="item-meta">${formatCurrency(it.price)} c/u</div>
        </div>

        <div class="cart-actions">
          <div class="cart-qty-controls" role="group" aria-label="Controles de cantidad">
            <button class="icon-btn" data-id="${it.id}" data-action="dec" aria-label="Disminuir cantidad">${minusSVG}</button>
            <div class="item-qty">${it.qty}</div>
            <button class="icon-btn" data-id="${it.id}" data-action="inc" aria-label="Aumentar cantidad">${plusSVG}</button>
          </div>

          <button class="remove-icon" data-id="${it.id}" data-action="rem" aria-label="Eliminar producto">
            ${trashSVG}
          </button>
        </div>
      `;

      cartItemsList.appendChild(li);
    });
  }

  // ---- CTA WhatsApp: habilitar / deshabilitar ----
  const isEmpty = cart.length === 0;

  whatsappBtn.disabled = isEmpty;
  whatsappBtn.style.opacity = isEmpty ? "0.5" : "1";
  whatsappBtn.style.pointerEvents = isEmpty ? "none" : "auto";

  // Resumen: Bebidas / Envío / Total
  const envioText = "Sin cargo";
  const total = subtotal; // si quisieras sumar envío, agrégalo aquí
  cartTotalEl.innerHTML = `
    <div class="summary-label">Resumen compra</div>
    <div class="summary-row"><span>Bebidas:</span><span>$${formatCurrency(subtotal)}</span></div>
    <div class="summary-row"><span>Envío:</span><span>${envioText}</span></div>
    <div class="summary-row total-row"><span>Total:</span><span>$${formatCurrency(total)}</span></div>
  `;
}



// ----------------- Panel carrito UI -----------------
function openCartPanel() {
  cartPanel.classList.add("open");
  cartToggle.classList.add("hidden");
}

function closeCartPanel() {
  cartPanel.classList.remove("open");
  cartToggle.classList.remove("hidden");
}

function toggleCart() {
  const isOpen = cartPanel.classList.contains("open");

  if (isOpen) {
    closeCartPanel();
    cartPanel.setAttribute("aria-hidden", "true");
  } else {
    openCartPanel();
    cartPanel.setAttribute("aria-hidden", "false");
  }
}

// ----------------- Handlers en las cards (combos) -----------------
function setupComboCardControls() {
  // 1) Cantidad visual dentro de la card (+ / -)
  document.querySelectorAll(".combo-card").forEach((card) => {
    // delegación local: buscar botones .qty-btn dentro de la card
    card.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qtyEl = card.querySelector(".qty");
        let current = parseInt(qtyEl.textContent || "1", 10);
        if (btn.textContent.trim() === "+") {
          current += 1;
        } else if (btn.textContent.trim() === "-") {
          current = Math.max(1, current - 1);
        } else {
          // si usan botones con data-action en card (no requerido)
          const action = btn.getAttribute("data-action");
          if (action === "inc") current += 1;
          if (action === "dec") current = Math.max(1, current - 1);
        }
        qtyEl.textContent = current;
      });
    });

    // 2) Botón agregar
      const addBtn = card.querySelector(".add-btn");

    if (addBtn) {
      addBtn.addEventListener("click", () => {
        // 1. Obtener elementos
        const nameEl = card.querySelector("h3");
        const priceEl = card.querySelector(".combo-price");
        const qtyEl = card.querySelector(".qty");
        const imgEl = card.querySelector("img");

        // 2. Normalizar datos
        const name = nameEl ? nameEl.textContent.trim() : "Producto";
        const price = priceEl ? parsePrice(priceEl.textContent) : 0;
        const qty = qtyEl ? Math.max(1, parseInt(qtyEl.textContent, 10)) : 1;
        const id = card.getAttribute("data-id") || slugify(name);
        const image = imgEl ? imgEl.src : "";

        // 3. Agregar al carrito
        addToCart({ id, name, price, qty, image });

        // 4. Feedback UX
        addBtn.classList.add("added");
        setTimeout(() => addBtn.classList.remove("added"), 600);

        // 5. Reset cantidad visual
        if (qtyEl) qtyEl.textContent = "1";

        // 6. Haptic feedback (mobile)
        if (navigator.vibrate) navigator.vibrate(30);
      });
    }
  });
}

// ----------------- Delegación de eventos en lista del carrito -----------------
cartItemsList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");
  if (action === "inc") changeQty(id, +1);
  if (action === "dec") changeQty(id, -1);
  if (action === "rem") removeItem(id);
});

// ----------------- WhatsApp: armar mensaje y abrir wa.me -----------------
function sendToWhatsApp() {
  if (cart.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  const lines = [];
  lines.push("Hola, quiero hacer el siguiente pedido:");
  lines.push("");

  let total = 0;
  cart.forEach((it) => {
    const subtotal = it.price * it.qty;
    total += subtotal;
    lines.push(`${it.qty} x ${it.name} - $${formatCurrency(subtotal)}`);
  });

  lines.push("");
  lines.push(`Total estimado: $${formatCurrency(total)}`);
  lines.push("");
  lines.push("¿Podemos coordinar entrega?");

  const message = encodeURIComponent(lines.join("\n"));
  const url = `https://wa.me/${PHONE_NUMBER}?text=${message}`;
  window.open(url, "_blank");
}


// ----------------- Eventos UI globales -----------------
cartToggle && cartToggle.addEventListener("click", toggleCart);
closeCartBtn && closeCartBtn.addEventListener("click", closeCartPanel);
whatsappBtn && whatsappBtn.addEventListener("click", sendToWhatsApp);


// ----------------- Inicialización -----------------
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar controles de las cards
  setupComboCardControls();
  // Renderizar carrito guardado
  renderCart();
});
