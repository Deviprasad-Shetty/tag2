// Shared tracking + page logic for Toy Store
const TRACKING_ENDPOINT = 'https://tracking.example.com/collect'; // <-- replace with your tracking server

function sendEvent(name, payload = {}){
  const data = { event: name, payload, page: location.pathname, ts: Date.now(), ua: navigator.userAgent };
  try{
    if(navigator.sendBeacon){
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(TRACKING_ENDPOINT, blob);
    } else {
      fetch(TRACKING_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).catch(()=>{});
    }
  }catch(e){ console.warn('tracking error', e); }
  console.log('tracking:', name, data);
}

// --- Cart utilities ---
function getCart(){ return JSON.parse(localStorage.getItem('toy_cart') || '[]'); }
function setCart(cart){ localStorage.setItem('toy_cart', JSON.stringify(cart)); renderCart(); }
function addToCart(item){ const cart = getCart(); const existing = cart.find(i=>i.id===item.id); if(existing){ existing.qty++; } else { cart.push({ ...item, qty: 1 }); } setCart(cart); sendEvent('add_to_cart', { item }); }

function renderCart(){
  const ul = document.getElementById('cart-items'); if(!ul) return; ul.innerHTML = '';
  const cart = getCart(); let total = 0;
  cart.forEach(i=>{ total += i.price * i.qty; const li = document.createElement('li'); li.textContent = `${i.name} x${i.qty} — $${(i.price * i.qty).toFixed(2)}`; ul.appendChild(li); });
  const totalEl = document.getElementById('cart-total'); if(totalEl) totalEl.textContent = total.toFixed(2);
}

// --- Page specific setup ---
document.addEventListener('DOMContentLoaded', ()=>{
  // Page view
  sendEvent('page_view', { title: document.title });

  // INDEX page: products and checkout
  const productsEl = document.getElementById('products');
  if(productsEl){
    const products = [
      { id: 'toy-1', name: 'Teddy Bear', price: 19.99 },
      { id: 'toy-2', name: 'RC Car', price: 49.99 },
      { id: 'toy-3', name: 'Building Blocks', price: 29.99 },
      { id: 'toy-4', name: 'Dollhouse', price: 79.99 }
    ];

    products.forEach(p=>{
      const card = document.createElement('article'); card.className = 'card';
      card.innerHTML = `<h3>${p.name}</h3><div>Price: $${p.price.toFixed(2)}</div><div style="margin-top:.5rem"><button data-id="${p.id}">Add to cart</button></div>`;
      productsEl.appendChild(card);
      card.querySelector('button').addEventListener('click', ()=> addToCart(p));
    });

    const checkoutBtn = document.getElementById('checkout');
    if(checkoutBtn){
      checkoutBtn.addEventListener('click', ()=>{
        const cart = getCart(); if(!cart.length){ alert('Cart is empty'); return; }
        const orderId = 'order-' + Date.now();
        const amount = cart.reduce((s,i)=>s + i.price * i.qty, 0).toFixed(2);
        sendEvent('begin_checkout', { orderId, items: cart, amount });
        const params = new URLSearchParams({ orderId, amount });
        location.href = `./thankyou.html?${params.toString()}`;
      });
    }

    // render cart initially
    renderCart();
  }

  // THANKYOU page: show summary, send purchase
  const orderSummary = document.getElementById('order-summary');
  if(orderSummary){
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId') || ('order-' + Date.now());
    const amount = params.get('amount') || '0.00';

    const cart = getCart();
    const msg = document.getElementById('message');
    if(msg) msg.textContent = 'Thank you for your purchase!';

    if(cart.length){
      const ul = document.createElement('ul');
      cart.forEach(i=>{ const li = document.createElement('li'); li.textContent = `${i.name} x${i.qty} — $${(i.price * i.qty).toFixed(2)}`; ul.appendChild(li); });
      orderSummary.appendChild(ul);
    } else {
      orderSummary.textContent = 'No cart details available in localStorage.';
    }
    const totalEl = document.createElement('p'); totalEl.innerHTML = `<strong>Order:</strong> ${orderId} &nbsp; <strong>Amount:</strong> $${parseFloat(amount).toFixed(2)}`;
    orderSummary.appendChild(totalEl);

    // send purchase and clear cart
    sendEvent('purchase', { orderId, amount: parseFloat(amount), items: cart });
    try{ localStorage.removeItem('toy_cart'); }catch(e){}
    sendEvent('thankyou_page_view', { orderId });
  }
});
