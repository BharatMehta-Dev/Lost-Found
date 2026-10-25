import { auth } from "./firebase.js";
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

/* =========================================================
   PROFILE
   profile.js
   ========================================================= */

if (!requireLogin()) {
    throw new Error("Authentication required.");
}

let currentProfile = null;

/* =========================================================
   LOAD PROFILE
   ========================================================= */

async function loadProfile() {

    try {

        const data =
            await apiRequest(
                "/users/me"
            );

        const user =
            data.user ||
            data;

        currentProfile = user;

        /* Basic information */

        setText(
            "profileName",
            user.name || "Student"

        );

        setText(
            "profileEmail",
            user.email || "Not available"
        );

        setText(
            "profileFullName",
            user.name || "Not available"
        );

        setText(
            "profileInstituteEmail",
            user.email || "Not available"
        );

        setText(
            "profileDepartment",
            formatDepartment(
                user.department
            )
        );

        setText(
            "profileYear",
            formatYear(user.year)
        );

        setText(
            "profileHostel",
            user.hostel || "Not specified"
        );


        /* Avatar */

        const avatar =
            document.getElementById(
                "profileAvatar"
            );


        if (avatar) {

            avatar.textContent =
                getInitials(
                    user.name
                );
        }


        /* Statistics */

        setText(
            "profileLostCount",
            user.stats?.lostReports ?? 0
        );

        setText(
            "profileFoundCount",
            user.stats?.foundReports ?? 0
        );

        setText(
            "profileClaimCount",
            user.stats?.claims ?? 0
        );

        setText(
            "profileReturnedCount",
            user.stats?.returnedItems ?? 0
        );


        setStoredUser(user);


    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }
}


/* =========================================================
   SET TEXT
   ========================================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {
        element.textContent = value;
    }
}


/* =========================================================
   DEPARTMENT FORMATTER
   ========================================================= */

function formatDepartment(
    department
) {

    const departments = {

        cse: "Computer Science",

        ece: "Electronics & Communication",

        ee: "Electrical Engineering",

        me: "Mechanical Engineering",

        ce: "Civil Engineering"

    };


    return departments[department] ||
        department ||
        "Not specified";
}


/* =========================================================
   YEAR FORMATTER
   ========================================================= */

function formatYear(year) {

    if (!year) {
        return "Not specified";
    }


    const suffixes = {
        1: "1st Year",
        2: "2nd Year",
        3: "3rd Year",
        4: "4th Year"
    };


    return suffixes[year] ||
        `${year} Year`;
}


/* =========================================================
   INITIALS
   ========================================================= */

function getInitials(
    name
) {

    if (!name) {
        return "S";
    }


    const words =
        name.trim().split(/\s+/);


    if (words.length === 1) {
        return words[0][0].toUpperCase();
    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


/* =========================================================
   EDIT PROFILE MODAL
   ========================================================= */

const editProfileButton = document.getElementById("editProfileBtn");
const editProfileModal = document.getElementById("editProfileModal");
const closeEditProfileModal = document.getElementById("closeEditProfileModal");
const cancelEditProfileBtn = document.getElementById("cancelEditProfileBtn");
const editProfileForm = document.getElementById("editProfileForm");

function openEditModal() {
    if (!editProfileModal) return;

    const nameInput = document.getElementById("editName");
    const deptInput = document.getElementById("editDepartment");
    const yearInput = document.getElementById("editYear");
    const hostelInput = document.getElementById("editHostel");
    const phoneInput = document.getElementById("editPhone");

    if (currentProfile) {
        if (nameInput) nameInput.value = currentProfile.name || "";
        if (deptInput && currentProfile.department) deptInput.value = currentProfile.department;
        if (yearInput && currentProfile.year) yearInput.value = currentProfile.year;
        if (hostelInput) hostelInput.value = currentProfile.hostel || "";
        if (phoneInput) phoneInput.value = currentProfile.phone || "";
    }

    editProfileModal.classList.remove("hidden");
}

function closeEditModal() {
    editProfileModal?.classList.add("hidden");
}

if (editProfileButton) {
    editProfileButton.addEventListener("click", openEditModal);
}

if (closeEditProfileModal) {
    closeEditProfileModal.addEventListener("click", closeEditModal);
}

if (cancelEditProfileBtn) {
    cancelEditProfileBtn.addEventListener("click", closeEditModal);
}

if (editProfileModal) {
    editProfileModal.addEventListener("click", (event) => {
        if (event.target === editProfileModal) closeEditModal();
    });
}

if (editProfileForm) {
    editProfileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitBtn = document.getElementById("saveProfileBtn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Saving...";
        }

        const name = document.getElementById("editName")?.value.trim();
        const department = document.getElementById("editDepartment")?.value;
        const year = document.getElementById("editYear")?.value;
        const hostel = document.getElementById("editHostel")?.value.trim() || "";
        const phone = document.getElementById("editPhone")?.value.trim() || "";

        try {
            const response = await apiRequest("/users/me", {
                method: "PUT",
                body: JSON.stringify({ name, department, year, hostel, phone })
            });

            showToast(response.message || "Profile updated successfully.", "success");
            closeEditModal();
            await loadProfile();
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Save Changes";
            }
        }
    });
}


/* =========================================================
   CHANGE PASSWORD MODAL
   ========================================================= */

const changePasswordButton = document.getElementById("changePasswordBtn");
const changePasswordModal = document.getElementById("changePasswordModal");
const closePasswordModal = document.getElementById("closePasswordModal");
const cancelPasswordBtn = document.getElementById("cancelPasswordBtn");
const changePasswordForm = document.getElementById("changePasswordForm");
const sendResetEmailBtn = document.getElementById("sendResetEmailBtn");

function openPasswordModal() {
    changePasswordModal?.classList.remove("hidden");
}

function closePasswordModalHandler() {
    changePasswordModal?.classList.add("hidden");
    changePasswordForm?.reset();
}

if (changePasswordButton) {
    changePasswordButton.addEventListener("click", openPasswordModal);
}

if (closePasswordModal) {
    closePasswordModal.addEventListener("click", closePasswordModalHandler);
}

if (cancelPasswordBtn) {
    cancelPasswordBtn.addEventListener("click", closePasswordModalHandler);
}

if (changePasswordModal) {
    changePasswordModal.addEventListener("click", (event) => {
        if (event.target === changePasswordModal) closePasswordModalHandler();
    });
}

if (sendResetEmailBtn) {
    sendResetEmailBtn.addEventListener("click", async () => {
        const user = auth.currentUser;
        const email = user?.email || currentProfile?.email;

        if (!email) {
            showToast("User email not found.", "error");
            return;
        }

        try {
            sendResetEmailBtn.disabled = true;
            sendResetEmailBtn.textContent = "Sending email...";
            await sendPasswordResetEmail(auth, email);
            showToast(`Password reset link sent to ${email}`, "success");
            closePasswordModalHandler();
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            sendResetEmailBtn.disabled = false;
            sendResetEmailBtn.textContent = "Send Reset Link to Email";
        }
    });
}

if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const currentPassword = document.getElementById("currentPassword")?.value;
        const newPassword = document.getElementById("newPassword")?.value;
        const confirmNewPassword = document.getElementById("confirmNewPassword")?.value;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showToast("Please fill in all password fields.", "error");
            return;
        }

        if (newPassword.length < 8) {
            showToast("New password must be at least 8 characters long.", "error");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showToast("New passwords do not match.", "error");
            return;
        }

        const user = auth.currentUser;
        if (!user || !user.email) {
            showToast("Please re-login to update your password.", "error");
            return;
        }

        const submitBtn = document.getElementById("savePasswordBtn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Updating...";
        }

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            showToast("Password updated successfully.", "success");
            closePasswordModalHandler();
        } catch (error) {
            console.error("Password update error:", error);
            if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
                showToast("Current password is incorrect.", "error");
            } else {
                showToast(error.message || "Failed to update password.", "error");
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Update Password";
            }
        }
    });
}



/* =========================================================
   LOGOUT
   ========================================================= */

const logoutButton =
    document.getElementById(
        "logoutBtn"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (confirmed) {
                logout();
            }

        }
    );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    loadProfile
);