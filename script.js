const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
// const priceInput = document.getElementById('prprice');
// const productName = document.getElementById('prni');
// const productSubmit = document.getElementById('addproduct');
const userName = localStorage.getItem("UserName") || '';
const phoneNumber = localStorage.getItem("PhoneNum") || '';
const emailGet = localStorage.getItem("Emailv") || '';
const passwordGet = localStorage.getItem("Passwordv") || '';
const rememberBox = document.getElementById('Remember');
const logInPage = document.getElementById("Login-Page");
const shopPage = document.getElementById("Shop-Page");
const profileImage = document.getElementById("profile-img");
let isChecked = localStorage.getItem("ischecked") || 0;
let isLogIn = localStorage.getItem("isLogIn") || 0;
// let itemNum = localStorage.getItem("Itemsnum") || 7;
const nameOU = document.getElementById("NameofU");
const snd = document.getElementById('sndt');
const addPage = document.getElementById('admin-section');
window.onload = () => {
if (isChecked){
rememberBox.checked = true;
}else{
rememberBox.checked = false;
}
if(isLogIn == 1){
logInPage.style.display = 'none';
shopPage.style.display = 'block';
showPage('productsPage')
}else{
shopPage.style.display = 'none';
logInPage.style.display = 'block';
}
nameOU.innerText = "Welcome " + userName;
}
rememberBox.onchange = () =>{
if(this.checked){
isChecked = 1;
localStorage.setItem("ischecked", isChecked);
}else{
isChecked = 0;
localStorage.setItem("ischecked", isChecked);
}
}
document.getElementById("loginForm").addEventListener("submit", () => {
let emailValue = String(emailInput.value);
let passwValue = String(passwordInput.value);
if(emailValue == emailGet && passwValue == passwordGet){
isLogIn = 1;
localStorage.setItem("isLogIn", isLogIn);
logInPage.style.display = 'none';
shopPage.style.display = 'block';
alert('Correct');
}else{
isLogIn = 0;
localStorage.setItem("isLogIn", isLogIn);
alert('incorrect');
}
});
if (localStorage.getItem('profile-img')) {
  profileImage.src = localStorage.getItem('profile-img');
}
document.getElementById('upload-photo').addEventListener('change', function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    profileImage.src = reader.result;
    // حفظ الصورة في localStorage
    localStorage.setItem('profile-img', reader.result);
  };
  reader.readAsDataURL(file);
});
let currentProduct = null;
let imageBase64 = '';

// معاينة الصورة
function previewImage(event) {
  let file = event.target.files[0];
  if(file) {
    let reader = new FileReader();
    reader.onload = function(e) {
      imageBase64 = e.target.result;
      document.getElementById('preview').src = imageBase64;
      document.getElementById('preview').style.display = 'block';
    }
    reader.readAsDataURL(file);
  }
}
// 1. المنتجات
function getItems() {
  let saved = localStorage.getItem('items');
  if(saved) return JSON.parse(saved);
  let defaultItems = [
  {id: 1, name: "DELL 5530", price: 19000, img: "DELL 5530.jpg", features: ["15.6' screen", "lots of ports: USB-A + Thunderbolt 4 + HDMI", "spill-resistant keyboard", "aluminum MIL-STD chassis"], cpu: ["Intel 12th Gen i5/i7 H-series"]},
  {id: 2, name: "DELL 5590", price: 10000, img: "DELL 5590.jpg", features: ["15.6' screen", "has both HDD + SSD slots for big storage", "tons of ports, military-grade durability"], cpu: ["Intel 8th Gen i5/i7"]},
  {id: 3, name: "DELL 7420", price: 19000, img: "DELL 7420.jpg", features: ["14' lightweight 1.35kg", "2K/4K screen option", "Thunderbolt 4", "IR camera for face login"], cpu: ["Intel 11th Gen i5/i7 U-series"]},
  {id: 4, name: "DELL 7490", price: 17000, img: "DELL 7490.jpg", features: ["14' screen, light 1.47kg", "excellent battery", "full ports: USB-A + HDMI + Type-C"], cpu: ["Intel 8th Gen i5/i7 U-series"]},
  {id: 5, name: "ASUS Vivobook Go 15", price: 15000, img: "ASUS Vivobook Go 15.jpg", features: ["15.6' screen", "light 1.6kg", "comfortable ErgoSense keyboard", "full ports"], cpu: ["Ryzen 3/5 or Intel i3 12th Gen"]},
  {id: 6, name: "Lenovo IdeaPad Slim 3", price: 17000, img: "Lenovo IdeaPad Slim 3.jpg", features: ["15.6' slim design", "thin bezels, 7-8 hours battery", "good keyboard"], cpu: ["Ryzen 5/7 or Intel i3/i5 12th-13th Gen"]},
  {id: 7, name: "Acer Aspire 3", price: 14000, img: "Acer Aspire 3.jpg", features: ["15.6' screen", "cheapest option", "has HDD + SSD slots", "full ports"], cpu: ["Ryzen 3/5 or Intel i3/i5"]}
];
  localStorage.setItem('items', JSON.stringify(defaultItems));
  return defaultItems;
}


// 2. التنقل بين الصفحات
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
document.getElementById('priceIn').addEventListener('input', function(e) {
  // يشيل أي حاجة مش رقم
  this.value = this.value.replace(/\D/g, '');
});
function addProduct() {
  let name = document.getElementById('name').value;
  let priceIn = document.getElementById('priceIn').value;
  let featuresText = document.getElementById('features').value;
  let cpuDInput = document.getElementById('cpuname').value;
  if(!name ||!priceIn) return alert('اكتب الاسم والسعر على الأقل');
  if(!imageBase64) return alert('اختار صورة للمنتج');
  if(!featuresText) return alert('يجب كتابة الميزات');

  let items = getItems();
  let newProduct = {
    id: Date.now(),
    name: name,
    price: priceIn,
    img: imageBase64,
    features: featuresText.split('\n').filter(f => f.trim()!= ''),
    cpu: cpuDInput
  };
  items.push(newProduct);
  localStorage.setItem('items', JSON.stringify(items));

  document.getElementById('name').value = '';
  document.getElementById('priceIn').value = '';
  document.getElementById('imgFile').value = '';
  document.getElementById('features').value = '';
  document.getElementById('cpuname').value = '';
  document.getElementById('preview').style.display = 'none';
  imageBase64 = '';
  showProducts();
  alert('تم إضافة المنتج ✅');
}
function addPro(){
  shopPage.style.display = 'none';
  addPage.style.display = 'block';
}
function backTo(){
  shopPage.style.display = 'block';
  addPage.style.display = 'none';
}
function showProducts() { 
  showPage('productsPage');
    let items = getItems();
  let html = '';
  items.forEach(item => {
    html += `
    <div class="card" id="card" onclick="showDetails(${item.id})">
      <img src="${item.img}">
      <h3>${item.name}</h3>
      <p>${item.price} EGP</p>
    </div>
    `;
  });
  document.getElementById('products').innerHTML = html;
  updateCartCount(); 
}
function showDetails(id) {
    let items = getItems();
  currentProduct = items.find(p => p.id === id);
  document.getElementById('pName').textContent = currentProduct.name;
  document.getElementById('pImg').src = currentProduct.img;
  document.getElementById('pPrice').textContent = currentProduct.price + ' EGP';
  document.getElementById('pFeatures').innerHTML = currentProduct.features.map(f => `<li>${f}</li>`).join('');
  document.getElementById('CPU').innerText = ' ' + currentProduct.cpu;
  showPage('detailsPage');
}

// 3. السلة
function addToCart() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(currentProduct);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(currentProduct.name + ' Added To Cart✅');
  updateCartCount();
}

function showCart() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let html = '';
  let total = 0;
  
  if(cart.length === 0) {
    html = '<p>Cart is Empty 🛒</p>';
  } else {
    cart.forEach((item, index) => {
      total += item.price;
      html += `
        <div class="cart-item">
          <img src="${item.img}">
          <div>
            <h4>${item.name}</h4>
            <p>${item.price} EGP</p>
            <button onclick="removeFromCart(${index})" style="background:#dc3545">Delete</button>
          </div>
        </div>
      `;
    });
  }
  
  document.getElementById('cartItems').innerHTML = html;
  document.getElementById('total').textContent = 'Total Price: ' + total + ' EGP';
  showPage('cartPage');
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  showCart();
  updateCartCount();
}

function clearCart() {
  localStorage.removeItem('cart');
  showCart();
  updateCartCount();
}

function checkout() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if(cart.length === 0) {
    alert('Cart is Empty');
    return;
  }
  alert('Purchase Completed✅');
  clearCart();
  showProducts();
}

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  document.getElementById('cartCount').textContent = cart.length;
}

showProducts()

document.getElementById('products').addEventListener("mouseenter", () => {
snd.play();
});