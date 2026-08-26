/* =========================================================
   DASHBOARD
   dashboard.js
   ========================================================= */


if (!requireLogin()) {
    throw new Error("Authentication required.");
}


/* =========================================================
   LOAD DASHBOARD
   ========================================================= */

async function loadDashboard() {

    try {

        const data =
            await apiRequest("/dashboard");


        /* User name */

        const userName =
            document.getElementById("userName");

        if (userName) {

            userName.textContent =
                data.user?.name ||
                getStoredUser()?.name ||
                "Student";
        }


        /* Statistics */

        const lostCount =
            document.getElementById("lostCount");

        const foundCount =
            document.getElementById("foundCount");

        const matchCount =
            document.getElementById("matchCount");

        const returnedCount =
            document.getElementById("returnedCount");


        if (lostCount) {
            lostCount.textContent =
                data.stats?.lostReports ?? 0;
        }

        if (foundCount) {
            foundCount.textContent =
                data.stats?.foundReports ?? 0;
        }

        if (matchCount) {
            matchCount.textContent =
                data.stats?.potentialMatches ?? 0;
        }

        if (returnedCount) {
            returnedCount.textContent =
                data.stats?.returnedItems ?? 0;
        }


        renderRecentActivity(
            data.recentActivity || []
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        /*
           Don't replace the dashboard with fake data.
           The backend will supply the real values.
        */

        showToast(
            error.message,
            "error"
        );
    }
}


/* =========================================================
   RECENT ACTIVITY
   ========================================================= */

function renderRecentActivity(activity) {

    const container =
        document.getElementById("recentActivity");

    if (!container) {
        return;
    }


    if (!activity.length) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📋
                </div>

                <h3>
                    No recent activity
                </h3>

                <p>
                    Your reports and notifications will appear here.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        activity.map(item => {

            return `
                <div class="notification-card">

                    <div class="notification-icon">
                        ${getActivityIcon(item.type)}
                    </div>

                    <div class="notification-content">

                        <h3>
                            ${escapeHTML(item.title)}
                        </h3>

                        <p>
                            ${escapeHTML(item.message)}
                        </p>

                        <div class="notification-time">
                            ${formatDate(item.createdAt)}
                        </div>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   ACTIVITY ICON
   ========================================================= */

function getActivityIcon(type) {

    const icons = {

        lost: "🔍",

        found: "📦",

        match: "🤝",

        claim: "📋",

        returned: "✅",

        notification: "🔔"
    };

    return icons[type] || "📌";
}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    loadDashboard
);