/* =========================================================
   NOTIFICATIONS
   notifications.js
   ========================================================= */


if (!requireLogin()) {
    throw new Error("Authentication required.");
}


const notificationsList =
    document.getElementById(
        "notificationsList"
    );

const markAllReadButton =
    document.getElementById(
        "markAllRead"
    );


/* =========================================================
   LOAD NOTIFICATIONS
   ========================================================= */

async function loadNotifications() {

    if (!notificationsList) {
        return;
    }


    try {

        const data =
            await apiRequest(
                "/notifications"
            );


        const notifications =
            data.notifications ||
            data.data ||
            [];


        renderNotifications(
            notifications
        );


    } catch (error) {

        notificationsList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load notifications
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;

    }
}


/* =========================================================
   RENDER
   ========================================================= */

function renderNotifications(
    notifications
) {

    if (!notifications.length) {

        notificationsList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🔔
                </div>

                <h3>
                    No notifications
                </h3>

                <p>
                    You're all caught up.
                </p>

            </div>
        `;

        return;
    }


    notificationsList.innerHTML =
        notifications.map(notification => {

            const isUnread =
                !notification.isRead;


            return `
                <article
                    class="notification-card ${isUnread ? "unread" : ""
                }"
                    data-id="${escapeHTML(
                    notification._id ||
                    notification.id
                )
                }"
                >

                    <div class="notification-icon">
                        ${getNotificationIcon(
                    notification.type
                )}
                    </div>


                    <div class="notification-content">

                        <h3>
                            ${escapeHTML(
                    notification.title ||
                    "Notification"
                )}
                        </h3>

                        <p>
                            ${escapeHTML(
                    notification.message ||
                    ""
                )}
                        </p>

                        <div class="notification-time">
                            ${formatDate(
                    notification.createdAt
                )}
                        </div>

                    </div>


                    ${isUnread
                    ? `
                                <button
                                    type="button"
                                    class="text-button"
                                    onclick="markNotificationRead('${escapeHTML(
                        notification._id ||
                        notification.id
                    )
                    }')"
                                >
                                    Mark read
                                </button>
                              `
                    : ""
                }

                </article>
            `;

        }).join("");
}


/* =========================================================
   ICON
   ========================================================= */

function getNotificationIcon(type) {

    const icons = {

        match: "🤝",

        claim: "📋",

        verification: "🔐",

        approved: "✅",

        rejected: "❌",

        returned: "🎉",

        system: "🔔"

    };

    return icons[type] || "🔔";
}


/* =========================================================
   MARK ONE AS READ
   ========================================================= */

async function markNotificationRead(
    notificationId
) {

    if (!notificationId) {
        return;
    }


    try {

        await apiRequest(
            `/notifications/${notificationId}/read`,
            {
                method: "PATCH"
            }
        );


        await loadNotifications();

        await loadNotificationCount();


    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }
}


/* =========================================================
   MARK ALL AS READ
   ========================================================= */

if (markAllReadButton) {

    markAllReadButton.addEventListener(
        "click",
        async () => {

            try {

                await apiRequest(
                    "/notifications/read-all",
                    {
                        method: "PATCH"
                    }
                );


                showToast(
                    "All notifications marked as read.",
                    "success"
                );


                await loadNotifications();

                await loadNotificationCount();


            } catch (error) {

                showToast(
                    error.message,
                    "error"
                );

            }

        }
    );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    loadNotifications
);