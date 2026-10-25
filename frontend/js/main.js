/* =========================================================
   LOST & FOUND MANAGEMENT SYSTEM
   main.js
   Global Frontend JavaScript
   ========================================================= */


/* =========================================================
   1. API CONFIGURATION
   ========================================================= */

const API_BASE_URL = "https://lost-found-ahv9.onrender.com/api";


/* =========================================================
   2. AUTHENTICATION STORAGE
   ========================================================= */

function getToken() {
    return localStorage.getItem("token");
}


function setToken(token) {
    localStorage.setItem("token", token);
}


function removeToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}


function getStoredUser() {
    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        return null;
    }
}


function setStoredUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
}


/* =========================================================
   3. AUTHENTICATION CHECK
   ========================================================= */

function isLoggedIn() {
    return Boolean(getToken());
}


function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}


/* =========================================================
   4. API REQUEST HELPER
   ========================================================= */

async function apiRequest(endpoint, options = {}) {

    const token = getToken();

    const headers = {
        ...options.headers
    };

    /*
       Don't manually set Content-Type when sending
       FormData because the browser automatically creates
       the correct multipart boundary.
    */

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );

        let data = {};

        try {
            data = await response.json();
        } catch (error) {
            data = {};
        }

        if (!response.ok) {
            console.error("API request failed:", {
                endpoint,
                status: response.status,
                data
            });

            if (response.status === 401) {
                removeToken();

                if (
                    !window.location.pathname.endsWith("login.html") &&
                    !window.location.pathname.endsWith("signup.html") &&
                    !window.location.pathname.endsWith("index.html")
                ) {
                    window.location.href = "login.html";
                }
            }

            throw new Error(
                data.details
                    ? `${data.message || "Something went wrong."} ${data.details}`
                    : data.message || "Something went wrong."
            );
        }

        return data;

    } catch (error) {

        if (error.name === "TypeError") {
            throw new Error(
                "Unable to connect to the server. Please make sure the backend is running."
            );
        }

        throw error;
    }
}


/* =========================================================
   5. LOGOUT
   ========================================================= */

function logout() {

    removeToken();

    window.location.href = "login.html";
}


/* =========================================================
   6. NOTIFICATION COUNT
   ========================================================= */

async function loadNotificationCount() {

    if (!isLoggedIn()) {
        return;
    }

    try {

        const data = await apiRequest("/notifications/unread-count");

        const count =
            data.count ??
            data.unreadCount ??
            0;

        document
            .querySelectorAll(".notification-count")
            .forEach(element => {

                element.textContent = count;

                if (count > 0) {
                    element.style.display = "flex";
                } else {
                    element.style.display = "none";
                }

            });

    } catch (error) {

        console.warn(
            "Notification count could not be loaded:",
            error.message
        );
    }
}


/* =========================================================
   7. DATE FORMATTER
   ========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "Unknown date";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


/* =========================================================
   8. TIME FORMATTER
   ========================================================= */

function formatTime(timeValue) {

    if (!timeValue) {
        return "";
    }

    const parts = timeValue.split(":");

    if (parts.length < 2) {
        return timeValue;
    }

    let hours = Number(parts[0]);
    const minutes = parts[1];

    if (Number.isNaN(hours)) {
        return timeValue;
    }

    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    return `${hours}:${minutes} ${period}`;
}


/* =========================================================
   9. ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    const div = document.createElement("div");

    div.textContent = String(value);

    return div.innerHTML;
}


/* =========================================================
   10. TOAST MESSAGE
   ========================================================= */

function showToast(message, type = "info") {

    let container = document.getElementById("toastContainer");

    if (!container) {

        container = document.createElement("div");

        container.id = "toastContainer";

        container.style.position = "fixed";
        container.style.top = "90px";
        container.style.right = "20px";
        container.style.zIndex = "5000";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "10px";

        document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    toast.textContent = message;

    toast.style.padding = "13px 18px";
    toast.style.borderRadius = "8px";
    toast.style.background = "#172033";
    toast.style.color = "#ffffff";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "600";
    toast.style.maxWidth = "350px";
    toast.style.boxShadow =
        "0 10px 30px rgba(15, 23, 42, 0.15)";

    if (type === "success") {
        toast.style.background = "#15803d";
    }

    if (type === "error") {
        toast.style.background = "#dc2626";
    }

    container.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.3s ease";

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3500);
}


/* =========================================================
   11. PAGE INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadNotificationCount();

    document
        .querySelectorAll("#logoutBtn")
        .forEach(button => {

            button.addEventListener("click", logout);

        });

});