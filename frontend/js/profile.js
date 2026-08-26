/* =========================================================
   PROFILE
   profile.js
   ========================================================= */


if (!requireLogin()) {
    throw new Error("Authentication required.");
}


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
   EDIT PROFILE
   ========================================================= */

const editProfileButton =
    document.getElementById(
        "editProfileBtn"
    );


if (editProfileButton) {

    editProfileButton.addEventListener(
        "click",
        () => {

            showToast(
                "Profile editing will be connected to the backend next.",
                "info"
            );

        }
    );
}


/* =========================================================
   CHANGE PASSWORD
   ========================================================= */

const changePasswordButton =
    document.getElementById(
        "changePasswordBtn"
    );


if (changePasswordButton) {

    changePasswordButton.addEventListener(
        "click",
        () => {

            showToast(
                "Password change will be connected to authentication next.",
                "info"
            );

        }
    );
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