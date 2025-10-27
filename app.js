
// Data sample
const PRODUCTS = [
  {id:'c001',title:'Pulsera Charmy Clásica - Plata 925',category:'pulsera',priceMenudeo:1299,priceMayoreo:999,stock:45,images:['https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=1200&auto=format&fit=crop']},
  {id:'c002',title:'Dije Corazón con circonia - Plata 925',category:'dije',priceMenudeo:449,priceMayoreo:349,stock:120,images:['https://images.unsplash.com/photo-1518544352643-6b18f8b8a7a5?q=80&w=1200&auto=format&fit=crop']},
  {id:'c003',title:'Set Pulsera + Dije - Edición Básica',category:'set',priceMenudeo:1699,priceMayoreo:1299,stock:20,images:['https://images.unsplash.com/photo-1534325962294-2a1d0c2561d6?q=80&w=1200&auto=format&fit=crop']},
  {id:'c004',title:'Separador clásico compatible charms - Plata 925',category:'accesorio',priceMenudeo:129,priceMayoreo:99,stock:300,images:['https://images.unsplash.com/photo-1541898629-7a8b5a1d1f3d?q=80&w=1200&auto=format&fit=crop']}
];

let cart = {}; // id -> qty
let wholesale = false;
const WHATSAPP_NUMBER = "522712263261"; // número proporcionado (sin +)

function money(v){ return v.toLocaleString('es-MX',{style:'currency',currency:'MXN',minimumFractionDigits:2}); }

function renderProducts(){
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  const q = (document.getElementById('search').value||'').toLowerCase();
  const sort = document.getElementById('sort').value;
  let items = PRODUCTS.filter(p => !q || p.title.toLowerCase().includes(q));
  if(sort==='price-asc') items.sort((a,b)=>( (wholesale?a.priceMayoreo:a.priceMenudeo) - (wholesale?b.priceMayoreo:b.priceMenudeo) ));
  if(sort==='price-desc') items.sort((a,b)=>( (wholesale?b.priceMayoreo:b.priceMenudeo) - (wholesale?a.priceMayoreo:a.priceMenudeo) ));
  items.forEach(p=>{
    const price = wholesale ? p.priceMayoreo : p.priceMenudeo;
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="product-image">${p.images && p.images[0] ? '<img src="'+p.images[0]+'" alt="'+p.title+'">' : ''}</div>
      <div class="product-title">${p.title}</div>
      <div class="small">Stock: ${p.stock}</div>
      <div class="price">${money(price)}</div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-primary" onclick="addToCart('${p.id}',1)">Agregar</button>
        <button class="btn btn-ghost" onclick="viewProduct('${p.id}')">Ver</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function loadCart(){
  const raw = localStorage.getItem('charmy_cart');
  if(raw) cart = JSON.parse(raw);
  updateCartUI();
}

function saveCart(){ localStorage.setItem('charmy_cart', JSON.stringify(cart)); updateCartUI(); }

function addToCart(id,qty=1){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  cart[id] = (cart[id]||0) + qty;
  if(cart[id] > p.stock) cart[id] = p.stock;
  saveCart();
  toast('Agregado al carrito');
}

function updateCartUI(){
  const list = document.getElementById('cartList');
  list.innerHTML = '';
  let subtotal = 0;
  let count = 0;
  for(const id of Object.keys(cart)){
    const p = PRODUCTS.find(x=>x.id===id);
    if(!p) continue;
    const qty = cart[id];
    const unit = wholesale ? p.priceMayoreo : p.priceMenudeo;
    subtotal += unit * qty;
    count += qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:700">${p.title}</div>
        <div class="small">${money(unit)} x ${qty}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <div class="qty-controls">
          <button class="btn btn-ghost" onclick="changeQty('${id}',-1)">-</button>
          <input type="number" value="${qty}" min="0" style="width:56px" onchange="setQty('${id}',this.value)">
          <button class="btn btn-ghost" onclick="changeQty('${id}',1)">+</button>
        </div>
        <button class="btn btn-ghost" onclick="removeFromCart('${id}')">Quitar</button>
      </div>
    `;
    list.appendChild(div);
  }
  document.getElementById('cartCount').textContent = count;
  document.getElementById('subtotalText').textContent = money(subtotal);
  document.getElementById('wholesaleApplied').textContent = wholesale ? 'Precios de mayoreo aplicados' : '';
  // show empty state
  if(count===0) list.innerHTML = '<div class="small muted">Tu carrito está vacío.</div>';
}

function changeQty(id,delta){
  setQty(id, (cart[id]||0) + delta);
}
function setQty(id,val){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const q = Math.max(0, Math.min(p.stock, Math.floor(Number(val)||0)));
  if(q===0) delete cart[id]; else cart[id]=q;
  saveCart();
}
function removeFromCart(id){ delete cart[id]; saveCart(); }

function viewProduct(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return alert(p.title);
  alert(p.title + "\n\nPrecio menudeo: " + money(p.priceMenudeo) + "\nPrecio mayoreo: " + money(p.priceMayoreo) + "\nStock: " + p.stock + "\n\nPlata 925. Diseño inspirado en el estilo europeo de charms.");
}

function openCart(){ document.getElementById('cartPanel').classList.remove('hidden'); document.getElementById('cartPanel').ariaHidden = "false"; }
function closeCart(){ document.getElementById('cartPanel').classList.add('hidden'); document.getElementById('cartPanel').ariaHidden = "true"; }

function orderWhatsApp(){
  const items = [];
  let total = 0;
  for(const id of Object.keys(cart)){
    const p = PRODUCTS.find(x=>x.id===id);
    const q = cart[id];
    const unit = wholesale ? p.priceMayoreo : p.priceMenudeo;
    items.push(q + ' x ' + p.title + ' = ' + money(unit*q));
    total += unit*q;
  }
  if(items.length===0) return alert('Tu carrito está vacío.');
  const message = encodeURIComponent('¡Hola Charmy! Me gustaría hacer un pedido:\n\n' + items.join('\n') + '\n\nTotal: ' + money(total) + '\n\nNombre: \nDirección: \nComentarios: ');
  const url = 'https://api.whatsapp.com/send?phone=' + WHATSAPP_NUMBER + '&text=' + message;
  window.open(url,'_blank');
}

function toast(msg){
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.position='fixed';el.style.right='20px';el.style.bottom='100px';el.style.background='rgba(0,0,0,0.8)';
  el.style.color='#fff';el.style.padding='8px 12px';el.style.borderRadius='8px';el.style.zIndex=9999;
  document.body.appendChild(el);
  setTimeout(()=> el.style.opacity=0,1500); setTimeout(()=> el.remove(),2100);
}

// Events binding
document.getElementById('search').addEventListener('input', renderProducts);
document.getElementById('sort').addEventListener('change', renderProducts);
document.getElementById('openCart').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('orderWhatsApp').addEventListener('click', orderWhatsApp);
document.getElementById('toggleWholesale').addEventListener('click', ()=>{
  wholesale = !wholesale;
  document.getElementById('toggleWholesale').textContent = wholesale ? 'Ver menudeo' : 'Ver mayoreo';
  renderProducts(); updateCartUI();
});

// footer whatsapp link
document.getElementById('whLinkFooter').setAttribute('href','https://api.whatsapp.com/send?phone='+WHATSAPP_NUMBER);

// init
document.getElementById('year').textContent = new Date().getFullYear();
loadCart();
renderProducts();
