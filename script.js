const IMAGE_MAP = {
  /* Cervezas */
  "Patagonia Amber Lager": "patagonia-amber-lager.webp",
  "Patagonia IPA": "patagonia-ipa.webp",
  "Amstel x6": "amstel-lager-x6-latas.webp",
  "Heineken x6": "heineken-x6-latas.webp",
  "Brahma x6": "brahma-x6-latas.webp",
  "Imperial APA x6": "imperial-apa-x6-latas.webp",
  "Imperial Golden x6": "imperial-golden-x6-latas.webp",
  "Imperial IPA x6": "imperial-ipa-x6-latas.webp",
  "Schneider Limón x6": "scheneider-limon-x6-latas.webp",
  "Miller x6": "miller-x6-latas.webp",
  "Monster x6": "monster-x6-latas.webp",

  /* Gaseosas / acompañantes */
  "Fernet + 2 Cocacolas + Hielo": "fernet+2-coca-1,5L+hielo.webp",
  "Coca Cola 1.5L + Hielo": "fernet+2-coca-1,5L+hielo.webp",
  "Gaseosas 500ml": "gaseosas-500ml.webp",
  "Gaseosa 500ml": "gaseosas-500ml.webp",
  "Aquarius 500ml": "aquarius-500ml.webp",
  "Gatorade 600ml": "gatorade-600ml.webp",
  "Levité 1,5L": "levite-1,5L.webp",

  /* Destilados / blancos */
  "Smirnoff x6 latas": "smirnoff-x6-latas.webp",
  "Smirnoff + 3 Speed": "smirnof+3-latas-speed.webp",
  "Smirnoff x6 (manzana/frambuesa)": "smirnoff-x6-latas.webp",
  "Skyy Apple + 4 Speed": "skyy-apple+4-latas-speed.webp",
  "Skyy Blueberry + 4 Speed": "skyy-blueberri+4-latas-speed.webp",
  "Skyy Cosmic + 4 Speed": "skyy-cosmic+4-latas-speed.webp",
  "Skyy Raspberry + 4 Speed": "skyy-raspberry+4-latas-speed.webp",
  "Skyy Andromeda + 4 Speed": "skyy-andromeda+4-latas-speed.webp",

  /* Vinos / otros */
  "Norton + 2 Speed": "norton+2-latas-speed.webp",
  "Equis": "equis.webp",
  "Campari + 2 Baggios": "campari+2-baggios.webp",
  "Dr Lemon 1,5L": "drlemon-1,5L.webp",
  "Gancia x6 latas": "Gancia-x6-latas.webp",
  "Gancia + Sprite + Hielo": "gancia+sprite+hielo.webp",
  "Beefeater + 2 Schweppes": "beefeater+2-schweepes.webp",
  "Merle + 2 Schweppes": "merle+2-scheweepes.webp",
  "Tres Plumas + 4 Speed": "tresplumas+4-latas-speed.webp"
};

function getProductImage(productName) {
  return IMAGE_MAP[productName] 
    ? `img/${IMAGE_MAP[productName]}`
    : "img/banner.webp"; // fallback elegante
}

// script.js - Carrito dinámico adaptado a product-card (reemplazar archivo actual)
// -------------------------------------------------------------------------------

const CART_KEY = "catalogo_cart_v3";
const PHONE_NUMBER = "5492241603438";

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
  return new Intl.NumberFormat("es-AR").format(n ? n : 0);
}

// Extrae número entero desde strings tipo "$14.500" o "$ 8.500"
function parsePrice(text) {
  if (!text && text !== 0) return 0;
  // Si ya es number
  if (typeof text === "number") return Math.round(text);
  // Si viene en data-price (string numérico)
  const asNum = Number(String(text).replace(/\s+/g, "").replace(",", "."));
  if (!Number.isNaN(asNum) && String(asNum).trim() !== "") return Math.round(asNum);

  // Quitar todo lo que no sea dígito
  const digits = String(text).replace(/\D+/g, "");
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

async function addToCart(item) {
  // item { id, name, price, qty, image }
  const existing = findItem(item.id);
  const isNew = !existing;
  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push({ ...item });
  }
  saveCart();
  await renderCart();

  // Si el producto agregado es único (no existía antes) y el panel
  // ya está abierto, hacer scroll para mostrar el último elemento.
  if (isNew && cartPanel && cartPanel.classList.contains("open") && cartItemsList) {
    setTimeout(() => {
      try {
        // si hay elementos, scrollear al final
        cartItemsList.scrollTop = cartItemsList.scrollHeight;
      } catch (e) {
        console.warn('scroll carrito falló', e);
      }
    }, 80);
  }
}

async function changeQty(id, delta) {
  const it = findItem(id);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) {
    cart = cart.filter((x) => x.id !== id);
  }
  saveCart();
  await renderCart();
}

async function removeItem(id) {
  cart = cart.filter((x) => x.id !== id);
  saveCart();
  await renderCart();
}

async function clearCart() {
  cart = [];
  saveCart();
  await renderCart();
}

async function syncCartPrices() {
  if (cart.length === 0) return;

  const ids = cart.map(i => i.id);

  const { data, error } = await client
    .from('products')
    .select('id, price')
    .in('id', ids);

  if (error) {
    console.error("Error sincronizando precios:", error);
    return;
  }

  data.forEach(product => {
    const item = cart.find(i => i.id === product.id);
    if (item) {
      item.price = product.price; // ← actualiza precio real
    }
  });

  saveCart();
}

// ----------------- Render del carrito -----------------
async function renderCart() {

  await syncCartPrices();
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

      const plusSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      const minusSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      const trashSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="#d32f2f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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
  if (whatsappBtn) {
    whatsappBtn.disabled = isEmpty;
    whatsappBtn.style.opacity = isEmpty ? "0.5" : "1";
    whatsappBtn.style.pointerEvents = isEmpty ? "none" : "auto";
  }

  // Resumen: Bebidas / Envío / Total
  const envioText = "Sin cargo";
  const total = subtotal;
  if (cartTotalEl) {
    cartTotalEl.innerHTML = `
      <div class="summary-label">Resumen compra</div>
      <div class="summary-row"><span>Bebidas:</span><span>$${formatCurrency(subtotal)}</span></div>
      <div class="summary-row"><span>Envío:</span><span>${envioText}</span></div>
      <div class="summary-row total-row"><span>Total:</span><span>$${formatCurrency(total)}</span></div>
    `;
  }
}

// ----------------- Panel carrito UI -----------------
function openCartPanel() {
  cartPanel.classList.add("open");
  cartToggle.classList.add("hidden");
  cartPanel.setAttribute("aria-hidden", "false");
  cartToggle.setAttribute("aria-expanded", "true");
  // bloquear scroll en html y body para evitar doble scrollbar mientras
  // el panel controlado es el que se mueve internamente
  document.documentElement.classList.add("cart-open");
  document.body.classList.add("cart-open");
}

function closeCartPanel() {
  cartPanel.classList.remove("open");
  cartToggle.classList.remove("hidden");
  cartPanel.setAttribute("aria-hidden", "true");
  cartToggle.setAttribute("aria-expanded", "false");
  document.documentElement.classList.remove("cart-open");
  document.body.classList.remove("cart-open");
}

function toggleCart() {
  const isOpen = cartPanel.classList.contains("open");
  if (isOpen) closeCartPanel();
  else openCartPanel();
}

// ----------------- Product card controls (cantidad + agregar) -----------------
function setupProductCardControls() {
  // Selecciona tanto .product-card como .combo-card (por compatibilidad)
  const cards = document.querySelectorAll(".product-card, .combo-card");

  cards.forEach((card) => {

    
    // Cantidad dentro de la card (+ / -)
    card.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qtyEl = card.querySelector(".qty");
        if (!qtyEl) return;
        let current = parseInt(qtyEl.textContent || "1", 10);
        const text = btn.textContent.trim();
        if (text === "+") current += 1;
        else if (text === "-") current = Math.max(1, current - 1);
        else {
          const action = btn.getAttribute("data-action");
          if (action === "inc") current += 1;
          if (action === "dec") current = Math.max(1, current - 1);
        }
        qtyEl.textContent = current;
      });
    });

    // Botón agregar
    const addBtn = card.querySelector(".add-btn");
    if (!addBtn) return;

    addBtn.addEventListener("click", () => {
      // 1) Obtener datos desde la card
      const titleEl = card.querySelector("h4, h3");
      const priceEl = card.querySelector(".price, .combo-price");
      const qtyEl = card.querySelector(".qty");
      const imgEl = card.querySelector("img");

      const name = titleEl ? titleEl.textContent.trim() : "Producto";
      // preferir data-price si existe
      let price = 0;
      if (priceEl) {
        const dataPrice = priceEl.getAttribute && priceEl.getAttribute("data-price");
        price = dataPrice ? parsePrice(dataPrice) : parsePrice(priceEl.textContent);
      }

      const qty = qtyEl ? Math.max(1, parseInt(qtyEl.textContent || "1", 10)) : 1;
      const idFromAttr = card.getAttribute("data-id");
      const id = idFromAttr || slugify(name);
      const image = imgEl ? imgEl.src : "";

      // 2) Agregar al carrito (antes del feedback)
      addToCart({ id, name, price, qty, image });

      // 3) Feedback UX: animación y reset cantidad
      addBtn.classList.add("added");
      setTimeout(() => addBtn.classList.remove("added"), 600);

      if (qtyEl) qtyEl.textContent = "1";

      // 4) Haptic (mobile)
      if (navigator.vibrate) navigator.vibrate(30);

      addBtn.offsetHeight; // fuerza repaint
    });
  });
}

// ----------------- Delegación de eventos en la lista del carrito -----------------
cartItemsList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");
  if (action === "inc") changeQty(id, +1);
  if (action === "dec") changeQty(id, -1);
  if (action === "rem") {
    removeItem(id);
  }
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
if (cartToggle) cartToggle.addEventListener("click", toggleCart);
if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartPanel);
if (whatsappBtn) whatsappBtn.addEventListener("click", sendToWhatsApp);

// ----------------- Inicialización -----------------
document.addEventListener("DOMContentLoaded", () => {
  setupProductCardControls();
  renderCart();
});


// Abrir modal al hacer click 3 veces
let adminClicks = 0;

document.addEventListener("DOMContentLoaded", () => {

  const trigger = document.getElementById("admin-trigger");
  const modal = document.getElementById("admin-modal");
  const exitBtn = document.getElementById("exit-edit");

  trigger.addEventListener("click", () => {
    adminClicks++;
    if (adminClicks >= 3) {
      modal.style.display = "flex";
      adminClicks = 0;
    }
  });

  modal.addEventListener("click", (e) => {
    if (e.target.id === "admin-modal") {
      modal.style.display = "none";
    }
  });

  if (exitBtn) {
    exitBtn.addEventListener("click", disableEditing);
  }

});

async function handleAdminLogin() {
  const password = document.getElementById("admin-password").value;

  const { error } = await client.auth.signInWithPassword({
    email: "admin@laprevia.com",
    password: password
  });

  if (error) {
    alert("Clave incorrecta");
  } else {
    document.getElementById("admin-modal").style.display = "none";
    enableEditing();
    alert("Modo edición activado");
  }
}

function enableEditing() {
  document.getElementById("edit-banner").style.display = "flex";

  const priceElements = document.querySelectorAll(".price");

  priceElements.forEach(priceEl => {
    const card = priceEl.closest("[data-id]");
    const id = card.getAttribute("data-id");

    priceEl.contentEditable = true;
    priceEl.style.border = "1px dashed #2ecc71";
    priceEl.style.cursor = "text";

    priceEl.addEventListener("blur", async () => {
      let newPrice = priceEl.textContent.replace("$", "").trim();

      if (isNaN(newPrice) || newPrice === "") {
        alert("Precio inválido");
        return;
      }

      await updatePrice(id, Number(newPrice));
    });
  });
}

async function updatePrice(id, newPrice) {
  const { error } = await client
    .from('products')
    .update({ price: newPrice })
    .eq('id', id);

  if (error) {
    console.error(error);
    alert("Error actualizando");
  } else {
    console.log("Precio actualizado:", id);
  }
}

function disableEditing() {
  document.getElementById("edit-banner").style.display = "none";

  const priceElements = document.querySelectorAll(".price");

  priceElements.forEach(priceEl => {
    priceEl.contentEditable = false;
    priceEl.style.border = "none";
    priceEl.style.cursor = "default";

    const clone = priceEl.cloneNode(true);
    priceEl.parentNode.replaceChild(clone, priceEl);
  });
}