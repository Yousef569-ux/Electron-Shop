import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const NameInput = document.getElementById("regName");
const emailInput = document.getElementById("regEmail");
const passwordInput = document.getElementById("regPassword");
const passwordConInput = document.getElementById("regConfirm");
const termsInput = document.getElementById("terms");

const registerForm = document.getElementById("registerForm");
const registerButton = document.querySelector(".btn-register");

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = String(NameInput.value).trim();
    const email = String(emailInput.value).trim();
    const password = String(passwordInput.value);
    const confirmPassword = String(passwordConInput.value);

    if (!termsInput.checked) {
        alert("PLEASE ACCEPT THE TERMS & CONDITIONS.");
        return;
    }

    if (password !== confirmPassword) {
        alert("SECURITY KEYS DO NOT MATCH");
        return;
    }

    if (password.length < 6) {
        alert("PASSWORD MUST CONTAIN AT LEAST 6 CHARACTERS.");
        return;
    }

    const originalText = registerButton.innerText;

    registerButton.disabled = true;
    registerButton.innerText = "PROCESSING...";

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        await updateProfile(user, {
            displayName: name
        });

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: name,
            email: email,
            photoURL: "",
            role: "user",
            createdAt: serverTimestamp()
        });

        alert("REGISTRATION SUCCESSFUL. REDIRECTING...");

        window.location.href = "index.html";

    } catch (error) {
        console.error("Registration error:", error);

        let message = "REGISTRATION ERROR.";

        switch (error.code) {
            case "auth/email-already-in-use":
                message = "THIS EMAIL IS ALREADY REGISTERED.";
                break;

            case "auth/invalid-email":
                message = "INVALID EMAIL ADDRESS.";
                break;

            case "auth/weak-password":
                message = "PASSWORD IS TOO WEAK.";
                break;

            case "auth/network-request-failed":
                message = "NETWORK ERROR. CHECK YOUR INTERNET CONNECTION.";
                break;

            default:
                message += "\n" + error.message;
        }

        alert(message);

        registerButton.disabled = false;
        registerButton.innerText = originalText;
    }
});


/* =========================
   STARS
========================= */

const starField = document.getElementById("starField");

for (let i = 0; i < 150; i++) {
    const star = document.createElement("div");

    star.className = "star";

    const duration = Math.random() * 3 + 2;
    const size = Math.random() * 2 + 1;

    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;

    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    star.style.setProperty("--duration", `${duration}s`);
    star.style.setProperty("--opacity", Math.random());

    starField.appendChild(star);
}


/* =========================
   CURSOR GLOW
========================= */

const cursorGlow = document.getElementById("cursorGlow");

document.addEventListener("mousemove", (e) => {
    requestAnimationFrame(() => {
        cursorGlow.style.left = e.clientX + "px";
        cursorGlow.style.top = e.clientY + "px";
    });
});


/* =========================
   CARD TILT
========================= */

const card = document.getElementById("tiltCard");

document.addEventListener("mousemove", (e) => {
    const x = (window.innerWidth / 2 - e.pageX) / 50;
    const y = (window.innerHeight / 2 - e.pageY) / 50;

    card.style.transform =
        `rotateY(${x}deg) rotateX(${y}deg)`;
});

document.addEventListener("mouseleave", () => {
    card.style.transition = "transform 0.5s ease";

    card.style.transform =
        "rotateY(0deg) rotateX(0deg)";

    setTimeout(() => {
        card.style.transition = "none";
    }, 500);
});

document.addEventListener("mouseenter", () => {
    card.style.transition = "none";
});