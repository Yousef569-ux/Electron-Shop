import { auth, db, storage } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    serverTimestamp,
    increment,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";


/* =========================
   DOM
========================= */

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const logInPage = document.getElementById("Login-Page");
const shopPage = document.getElementById("Shop-Page");
const addPage = document.getElementById("admin-section");

const nameOU = document.getElementById("NameofU");
const profileImage = document.getElementById("profile-img");

const logoutBtn = document.getElementById("logoutBtn");
const recoverAccess = document.getElementById("recoverAccess");

const loginForm = document.getElementById("loginForm");

const productsContainer = document.getElementById("products");

const snd = document.getElementById("sndt");


/* =========================
   STATE
========================= */

let currentUser = null;
let currentUserProfile = null;

let currentProduct = null;

let firestoreProducts = [];
let cartItems = [];

let selectedProductImage = null;
let profileListener = null;
let cartListener = null;
let productsListener = null;


/* =========================
   DEFAULT PRODUCTS
========================= */

const DEFAULT_PRODUCTS = [
    {
        id: "default-1",
        name: "DELL 5530",
        price: 19000,
        img: "DELL 5530.jpg",
        features: [
            "15.6' screen",
            "lots of ports: USB-A + Thunderbolt 4 + HDMI",
            "spill-resistant keyboard",
            "aluminum MIL-STD chassis"
        ],
        cpu: ["Intel 12th Gen i5/i7 H-series"]
    },

    {
        id: "default-2",
        name: "DELL 5590",
        price: 10000,
        img: "DELL 5590.jpg",
        features: [
            "15.6' screen",
            "has both HDD + SSD slots for big storage",
            "tons of ports, military-grade durability"
        ],
        cpu: ["Intel 8th Gen i5/i7"]
    },

    {
        id: "default-3",
        name: "DELL 7420",
        price: 19000,
        img: "DELL 7420.jpg",
        features: [
            "14' lightweight 1.35kg",
            "2K/4K screen option",
            "Thunderbolt 4",
            "IR camera for face login"
        ],
        cpu: ["Intel 11th Gen i5/i7 U-series"]
    },

    {
        id: "default-4",
        name: "DELL 7490",
        price: 17000,
        img: "DELL 7490.jpg",
        features: [
            "14' screen, light 1.47kg",
            "excellent battery",
            "full ports: USB-A + HDMI + Type-C"
        ],
        cpu: ["Intel 8th Gen i5/i7 U-series"]
    },

    {
        id: "default-5",
        name: "ASUS Vivobook Go 15",
        price: 15000,
        img: "ASUS Vivobook Go 15.jpg",
        features: [
            "15.6' screen",
            "light 1.6kg",
            "comfortable ErgoSense keyboard",
            "full ports"
        ],
        cpu: ["Ryzen 3/5 or Intel i3 12th Gen"]
    },

    {
        id: "default-6",
        name: "Lenovo IdeaPad Slim 3",
        price: 17000,
        img: "Lenovo IdeaPad Slim 3.jpg",
        features: [
            "15.6' slim design",
            "thin bezels, 7-8 hours battery",
            "good keyboard"
        ],
        cpu: ["Ryzen 5/7 or Intel i3/i5 12th-13th Gen"]
    },

    {
        id: "default-7",
        name: "Acer Aspire 3",
        price: 14000,
        img: "Acer Aspire 3.jpg",
        features: [
            "15.6' screen",
            "cheapest option",
            "has HDD + SSD slots",
            "full ports"
        ],
        cpu: ["Ryzen 3/5 or Intel i3/i5"]
    }
];


/* =========================
   HELPERS
========================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getCurrentItems() {
    return [...DEFAULT_PRODUCTS, ...firestoreProducts];
}

function getProductById(id) {
    return getCurrentItems().find(item => String(item.id) === String(id));
}

function getCpuText(cpu) {
    if (Array.isArray(cpu)) {
        return cpu.join(", ");
    }

    return cpu || "N/A";
}

function getCartDocId(productId) {
    return String(productId).replace(/\//g, "_");
}


/* =========================
   UI
========================= */

function showLogin() {
    logInPage.style.display = "block";
    shopPage.style.display = "none";
    addPage.style.display = "none";
    document.getElementById("body").style.overflow = "hidden";
}

function showShop() {
    logInPage.style.display = "none";
    shopPage.style.display = "block";
    addPage.style.display = "none";
    document.getElementById("body").style.overflow = "auto";
}

function addPro() {
    if (!currentUserProfile || currentUserProfile.role !== "admin") {
        alert("ACCESS DENIED");
        return;
    }

    shopPage.style.display = "none";
    addPage.style.display = "block";
}

function backTo() {
    shopPage.style.display = "block";
    addPage.style.display = "none";
}

function showPage(id) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");
}


/* =========================
   AUTH
========================= */

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const btn = document.querySelector(".btn-login");

    const originalText = btn.innerText;

    btn.disabled = true;
    btn.innerText = "AUTHENTICATING...";

    try {
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
    } catch (error) {
        console.error(error);

        let message = "ACCESS DENIED.";

        switch (error.code) {
            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":
                message = "INVALID EMAIL OR PASSWORD.";
                break;

            case "auth/invalid-email":
                message = "INVALID EMAIL ADDRESS.";
                break;

            case "auth/network-request-failed":
                message = "NETWORK ERROR.";
                break;

            default:
                message += "\n" + error.message;
        }

        alert(message);

        btn.disabled = false;
        btn.innerText = originalText;
    }
});


/* =========================
   PASSWORD RECOVERY
========================= */

recoverAccess.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
        alert("ENTER YOUR EMAIL ADDRESS FIRST.");
        emailInput.focus();
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);

        alert(
            "PASSWORD RESET EMAIL SENT.\nCHECK YOUR EMAIL."
        );

    } catch (error) {
        console.error(error);

        alert(
            "PASSWORD RESET FAILED:\n" +
            error.message
        );
    }
});


/* =========================
   LOGOUT
========================= */

logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout error:", error);
    }
});


/* =========================
   USER PROFILE
========================= */

async function ensureUserDocument(user) {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
            role: "user",
            createdAt: serverTimestamp()
        });
    }
}

async function loadUserProfile(user) {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
        return snapshot.data();
    }

    return {
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        role: "user"
    };
}


/* =========================
   PROFILE PHOTO
========================= */

document.getElementById("upload-photo").addEventListener("change", async (e) => {
    const file = e.target.files[0];

    if (!file || !currentUser) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("PLEASE SELECT AN IMAGE.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("PROFILE IMAGE MUST BE 5MB OR LESS.");
        return;
    }

    try {
        profileImage.style.opacity = "0.5";

        const storageRef = ref(
            storage,
            `profilePhotos/${currentUser.uid}/profile`
        );

        await uploadBytes(storageRef, file, {
            contentType: file.type
        });

        const url = await getDownloadURL(storageRef);

        await updateProfile(currentUser, {
            photoURL: url
        });

        await setDoc(
            doc(db, "users", currentUser.uid),
            {
                photoURL: url
            },
            {
                merge: true
            }
        );

        profileImage.src = url;

        if (currentUserProfile) {
            currentUserProfile.photoURL = url;
        }

    } catch (error) {
        console.error("Profile upload error:", error);

        alert(
            "PROFILE IMAGE UPLOAD FAILED:\n" +
            error.message
        );

    } finally {
        profileImage.style.opacity = "1";
    }
});


/* =========================
   PRODUCTS
========================= */

function startProductsListener() {
    if (productsListener) {
        productsListener();
        productsListener = null;
    }

    productsListener = onSnapshot(
        collection(db, "products"),
        snapshot => {

            firestoreProducts = snapshot.docs.map(docSnapshot => ({
                id: docSnapshot.id,
                ...docSnapshot.data()
            }));

            renderProducts();
        },
        error => {
            console.error("Products listener error:", error);
        }
    );
}

function renderProducts() {
    const items = getCurrentItems();

    let html = "";

    items.forEach(item => {
        html += `
            <div class="card"
                 onclick="showDetails('${escapeHTML(item.id)}')">

                <img
                    src="${escapeHTML(item.img)}"
                    alt="${escapeHTML(item.name)}"
                >

                <h3>${escapeHTML(item.name)}</h3>

                <p>
                    ${Number(item.price || 0).toLocaleString()}
                    EGP
                </p>

            </div>
        `;
    });

    productsContainer.innerHTML = html;

    updateCartCount();
}

function showProducts() {
    showPage("productsPage");
    renderProducts();
}


/* =========================
   PRODUCT PREVIEW
========================= */

function previewImage(event) {
    const file = event.target.files[0];

    if (!file) {
        selectedProductImage = null;
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("PLEASE SELECT AN IMAGE.");
        event.target.value = "";
        selectedProductImage = null;
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert("PRODUCT IMAGE MUST BE 10MB OR LESS.");
        event.target.value = "";
        selectedProductImage = null;
        return;
    }

    selectedProductImage = file;

    const previewUrl = URL.createObjectURL(file);

    const preview = document.getElementById("preview");

    preview.src = previewUrl;
    preview.style.display = "block";
}


/* =========================
   ADD PRODUCT
========================= */

async function addProduct() {

    if (!currentUser || !currentUserProfile) {
        alert("YOU MUST BE LOGGED IN.");
        return;
    }

    if (currentUserProfile.role !== "admin") {
        alert("ACCESS DENIED");
        return;
    }

    const name = document.getElementById("name").value.trim();
    const priceInput = document.getElementById("priceIn").value.trim();
    const featuresText = document.getElementById("features").value.trim();
    const cpuInput = document.getElementById("cpuname").value.trim();

    if (!name || !priceInput) {
        alert("اكتب الاسم والسعر على الأقل");
        return;
    }

    if (!selectedProductImage) {
        alert("اختار صورة للمنتج");
        return;
    }

    if (!featuresText) {
        alert("يجب كتابة الميزات");
        return;
    }

    const price = Number(priceInput);

    if (!Number.isFinite(price) || price < 0) {
        alert("PRICE IS INVALID.");
        return;
    }

    try {

        const safeFileName =
            `${Date.now()}_${selectedProductImage.name}`
                .replace(/[^\w.-]/g, "_");

        const imageRef = ref(
            storage,
            `productImages/${currentUser.uid}/${safeFileName}`
        );

        await uploadBytes(
            imageRef,
            selectedProductImage,
            {
                contentType: selectedProductImage.type
            }
        );

        const imageUrl = await getDownloadURL(imageRef);

        await addDoc(
            collection(db, "products"),
            {
                name,
                price,
                img: imageUrl,

                features: featuresText
                    .split("\n")
                    .map(feature => feature.trim())
                    .filter(Boolean),

                cpu: cpuInput,

                createdBy: currentUser.uid,
                createdAt: serverTimestamp()
            }
        );

        document.getElementById("name").value = "";
        document.getElementById("priceIn").value = "";
        document.getElementById("imgFile").value = "";
        document.getElementById("features").value = "";
        document.getElementById("cpuname").value = "";

        document.getElementById("preview").style.display = "none";
        document.getElementById("preview").removeAttribute("src");

        selectedProductImage = null;

        showShop();
        showProducts();

        alert("تم إضافة المنتج ✅");

    } catch (error) {
        console.error("Add product error:", error);

        alert(
            "FAILED TO ADD PRODUCT:\n" +
            error.message
        );
    }
}


/* =========================
   PRICE INPUT
========================= */

document.getElementById("priceIn").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
});


/* =========================
   PRODUCT DETAILS
========================= */

function showDetails(id) {

    const product = getProductById(id);

    if (!product) {
        alert("PRODUCT NOT FOUND.");
        return;
    }

    currentProduct = product;

    document.getElementById("pName").textContent =
        product.name;

    document.getElementById("pImg").src =
        product.img;

    document.getElementById("pPrice").textContent =
        Number(product.price || 0).toLocaleString() + " EGP";

    document.getElementById("CPU").textContent =
        " " + getCpuText(product.cpu);

    const featureList =
        document.getElementById("pFeatures");

    featureList.innerHTML = "";

    const features = Array.isArray(product.features)
        ? product.features
        : [];

    features.forEach(feature => {
        const li = document.createElement("li");
        li.textContent = feature;
        featureList.appendChild(li);
    });

    showPage("detailsPage");
}


/* =========================
   CART LISTENER
========================= */

function startCartListener() {

    if (cartListener) {
        cartListener();
        cartListener = null;
    }

    if (!currentUser) {
        cartItems = [];
        updateCartCount();
        return;
    }

    cartListener = onSnapshot(
        collection(db, "users", currentUser.uid, "cart"),
        snapshot => {

            cartItems = snapshot.docs.map(docSnapshot => ({
                cartId: docSnapshot.id,
                ...docSnapshot.data()
            }));

            updateCartCount();

        },
        error => {
            console.error("Cart listener error:", error);
        }
    );
}


/* =========================
   ADD TO CART
========================= */

async function addToCart() {

    if (!currentUser) {
        alert("PLEASE LOGIN FIRST.");
        return;
    }

    if (!currentProduct) {
        return;
    }

    const cartId =
        getCartDocId(currentProduct.id);

    const cartRef =
        doc(db, "users", currentUser.uid, "cart", cartId);

    try {

        const existing = await getDoc(cartRef);

        if (existing.exists()) {

            await updateDoc(cartRef, {
                quantity: increment(1)
            });

        } else {

            await setDoc(cartRef, {
                productId: String(currentProduct.id),
                name: currentProduct.name,
                price: Number(currentProduct.price || 0),
                img: currentProduct.img,
                quantity: 1,
                createdAt: serverTimestamp()
            });
        }

        alert(
            currentProduct.name +
            " Added To Cart ✅"
        );

    } catch (error) {

        console.error("Cart error:", error);

        alert(
            "FAILED TO ADD TO CART:\n" +
            error.message
        );
    }
}


/* =========================
   CART
========================= */

function showCart() {

    const cartContainer =
        document.getElementById("cartItems");

    let total = 0;

    if (cartItems.length === 0) {

        cartContainer.innerHTML =
            "<p>Cart is Empty 🛒</p>";

    } else {

        let html = "";

        cartItems.forEach(item => {

            const quantity =
                Number(item.quantity || 1);

            const price =
                Number(item.price || 0);

            total += price * quantity;

            html += `
                <div class="cart-item">

                    <img
                        src="${escapeHTML(item.img)}"
                        alt="${escapeHTML(item.name)}"
                    >

                    <div>
                        <h4>
                            ${escapeHTML(item.name)}
                        </h4>

                        <p>
                            ${price.toLocaleString()} EGP
                        </p>

                        <p>
                            Quantity: ${quantity}
                        </p>

                        <button
                            onclick="removeFromCart('${escapeHTML(item.cartId)}')"
                            style="background:#dc3545"
                        >
                            Delete
                        </button>
                    </div>

                </div>
            `;
        });

        cartContainer.innerHTML = html;
    }

    document.getElementById("total").textContent =
        "Total Price: " +
        total.toLocaleString() +
        " EGP";

    showPage("cartPage");
}


/* =========================
   REMOVE FROM CART
========================= */

async function removeFromCart(cartId) {

    if (!currentUser) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                "users",
                currentUser.uid,
                "cart",
                cartId
            )
        );

        showCart();

    } catch (error) {
        console.error(error);

        alert(
            "FAILED TO REMOVE ITEM:\n" +
            error.message
        );
    }
}


/* =========================
   CLEAR CART
========================= */

async function clearCart() {

    if (!currentUser) {
        return;
    }

    if (cartItems.length === 0) {
        showCart();
        return;
    }

    try {

        const batch = writeBatch(db);

        cartItems.forEach(item => {

            batch.delete(
                doc(
                    db,
                    "users",
                    currentUser.uid,
                    "cart",
                    item.cartId
                )
            );
        });

        await batch.commit();

        showCart();

    } catch (error) {

        console.error(error);

        alert(
            "FAILED TO CLEAR CART:\n" +
            error.message
        );
    }
}


/* =========================
   CHECKOUT
========================= */

async function checkout() {

    if (!currentUser) {
        alert("PLEASE LOGIN FIRST.");
        return;
    }

    if (cartItems.length === 0) {
        alert("Cart is Empty");
        return;
    }

    const total = cartItems.reduce(
        (sum, item) =>
            sum +
            Number(item.price || 0) *
            Number(item.quantity || 1),
        0
    );

    try {

        await addDoc(
            collection(db, "orders"),
            {
                userId: currentUser.uid,

                items: cartItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: Number(item.price || 0),
                    quantity: Number(item.quantity || 1)
                })),

                total,
                status: "placed",
                createdAt: serverTimestamp()
            }
        );

        await clearCart();

        showProducts();

        alert(
            "ORDER RECORDED ✅\n" +
            "TOTAL: " +
            total.toLocaleString() +
            " EGP"
        );

    } catch (error) {

        console.error("Checkout error:", error);

        alert(
            "CHECKOUT FAILED:\n" +
            error.message
        );
    }
}


/* =========================
   CART COUNT
========================= */

function updateCartCount() {

    const count =
        cartItems.reduce(
            (sum, item) =>
                sum + Number(item.quantity || 1),
            0
        );

    document.getElementById("cartCount").textContent =
        count;
}


/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(auth, async (user) => {

    currentUser = user;

    if (!user) {

        if (productsListener) {
            productsListener();
            productsListener = null;
        }

        if (cartListener) {
            cartListener();
            cartListener = null;
        }

        firestoreProducts = [];
        cartItems = [];
        currentUserProfile = null;

        showLogin();

        return;
    }

    try {

        await ensureUserDocument(user);

        currentUserProfile =
            await loadUserProfile(user);

        nameOU.textContent =
            "Welcome " +
            (currentUserProfile.displayName ||
             user.displayName ||
             user.email);

        const photo =
            currentUserProfile.photoURL ||
            user.photoURL;

        if (photo) {
            profileImage.src = photo;
        }

        if (currentUserProfile.role === "admin") {

            addPage.style.display = "none";

            document.getElementById(
                "Addp-Button"
            ).style.display = "inline-block";

        } else {

            document.getElementById(
                "Addp-Button"
            ).style.display = "none";

            addPage.style.display = "none";
        }

        showShop();

        showProducts();

        startProductsListener();

        startCartListener();

    } catch (error) {

        console.error(
            "User initialization failed:",
            error
        );

        alert(
            "ACCOUNT INITIALIZATION FAILED:\n" +
            error.message
        );

        await signOut(auth);
    }
});


/* =========================
   VISUAL EFFECTS
========================= */

const starField =
    document.getElementById("starField");

if (starField) {

    for (let i = 0; i < 150; i++) {

        const star =
            document.createElement("div");

        star.className = "star";

        const duration =
            Math.random() * 3 + 2;

        const size =
            Math.random() * 2 + 1;

        star.style.left =
            `${Math.random() * 100}%`;

        star.style.top =
            `${Math.random() * 100}%`;

        star.style.width =
            `${size}px`;

        star.style.height =
            `${size}px`;

        star.style.setProperty(
            "--duration",
            `${duration}s`
        );

        star.style.setProperty(
            "--opacity",
            Math.random()
        );

        starField.appendChild(star);
    }
}


const cursorGlow =
    document.getElementById("cursorGlow");

if (cursorGlow) {

    document.addEventListener(
        "mousemove",
        e => {

            requestAnimationFrame(() => {

                cursorGlow.style.left =
                    e.clientX + "px";

                cursorGlow.style.top =
                    e.clientY + "px";
            });
        }
    );
}


const Tcard =
    document.getElementById("tiltCard");

if (Tcard) {

    document.addEventListener(
        "mousemove",
        e => {

            const x =
                (window.innerWidth / 2 - e.pageX) / 45;

            const y =
                (window.innerHeight / 2 - e.pageY) / 45;

            Tcard.style.transform =
                `rotateY(${x}deg) rotateX(${y}deg)`;
        }
    );

    document.addEventListener(
        "mouseleave",
        () => {

            Tcard.style.transition =
                "transform 0.5s ease";

            Tcard.style.transform =
                "rotateY(0deg) rotateX(0deg)";

            setTimeout(() => {

                Tcard.style.transition =
                    "none";

            }, 500);
        }
    );

    document.addEventListener(
        "mouseenter",
        () => {
            Tcard.style.transition = "none";
        }
    );
}


/* =========================
   SOUND
========================= */

if (productsContainer && snd) {

    productsContainer.addEventListener(
        "mouseenter",
        () => {

            snd.currentTime = 0;

            snd.play().catch(() => {});
        }
    );
}


/* =========================
   INLINE HTML COMPATIBILITY
========================= */

window.showCart = showCart;
window.showProducts = showProducts;
window.showDetails = showDetails;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.checkout = checkout;

window.addPro = addPro;
window.backTo = backTo;
window.addProduct = addProduct;
window.previewImage = previewImage;