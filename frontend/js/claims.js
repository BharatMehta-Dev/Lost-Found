/* =========================================================
   CLAIMS & VERIFICATION
   claims.js
   ========================================================= */


if (!requireLogin()) {
    throw new Error("Authentication required.");
}


/* =========================================================
   DOM
   ========================================================= */

const tabButtons =
    document.querySelectorAll(
        ".tab-button"
    );

const tabContents =
    document.querySelectorAll(
        ".tab-content"
    );

const claimsList =
    document.getElementById(
        "claimsList"
    );

const verificationRequests =
    document.getElementById(
        "verificationRequests"
    );


/* =========================================================
   TABS
   ========================================================= */

tabButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const target =
                button.dataset.tab;


            tabButtons.forEach(item => {
                item.classList.remove("active");
            });


            tabContents.forEach(content => {
                content.classList.remove("active");
            });


            button.classList.add("active");


            const targetContent =
                document.getElementById(target);


            targetContent?.classList.add(
                "active"
            );

        }
    );

});


/* =========================================================
   LOAD CLAIMS
   ========================================================= */

async function loadClaims() {

    if (!claimsList) {
        return;
    }


    try {

        const data =
            await apiRequest(
                "/claims"
            );


        const claims =
            data.claims ||
            data.data ||
            [];


        renderClaims(
            claims
        );


    } catch (error) {

        claimsList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load claims
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;

    }
}


/* =========================================================
   RENDER CLAIMS
   ========================================================= */

function renderClaims(claims) {

    if (!claims.length) {

        claimsList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📋
                </div>

                <h3>
                    No claims yet
                </h3>

                <p>
                    Potential claims will appear here.
                </p>

            </div>
        `;

        return;
    }


    claimsList.innerHTML =
        claims.map(claim => {

            const item =
                claim.foundItem ||
                claim.item ||
                {};


            const status =
                claim.status ||
                "pending";


            return `
                <article class="notification-card">

                    <div class="notification-icon">
                        ${status === "approved"
                    ? "✅"
                    : status === "rejected"
                        ? "❌"
                        : "📋"
                }
                    </div>


                    <div class="notification-content">

                        <h3>
                            ${escapeHTML(
                    item.itemName ||
                    "Claimed Item"
                )}
                        </h3>


                        <p>
                            Claim status:
                            <strong>
                                ${escapeHTML(status)}
                            </strong>
                        </p>


                        <div class="notification-time">

                            Submitted:
                            ${formatDate(
                    claim.createdAt
                )}

                        </div>

                    </div>

                </article>
            `;

        }).join("");
}


/* =========================================================
   LOAD VERIFICATION REQUESTS
   ========================================================= */

async function loadVerificationRequests() {

    if (!verificationRequests) {
        return;
    }


    try {

        const data =
            await apiRequest(
                "/claims/verification"
            );


        const requests =
            data.requests ||
            data.claims ||
            data.data ||
            [];


        renderVerificationRequests(
            requests
        );


    } catch (error) {

        verificationRequests.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load verification requests
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;

    }
}


/* =========================================================
   RENDER VERIFICATION
   ========================================================= */

function renderVerificationRequests(
    requests
) {

    if (!requests.length) {

        verificationRequests.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🔒
                </div>

                <h3>
                    No verification requests
                </h3>

                <p>
                    Verification requests will appear here.
                </p>

            </div>
        `;

        return;
    }


    verificationRequests.innerHTML =
        requests.map(request => {

            const item =
                request.foundItem ||
                request.item ||
                {};


            return `
                <article class="notification-card">

                    <div class="notification-icon">
                        🔐
                    </div>


                    <div class="notification-content">

                        <h3>
                            ${escapeHTML(
                item.itemName ||
                "Item Verification"
            )}
                        </h3>


                        <p>
                            A claim requires verification.
                        </p>


                        <div class="notification-time">
                            ${formatDate(
                request.createdAt
            )}
                        </div>


                        <div
                            style="
                                display:flex;
                                gap:10px;
                                margin-top:15px;
                                flex-wrap:wrap;
                            "
                        >

                            <button
                                type="button"
                                class="btn btn-primary"
                                onclick="approveClaim('${escapeHTML(
                request._id ||
                request.id
            )
                }')"
                            >
                                Approve
                            </button>


                            <button
                                type="button"
                                class="btn btn-danger"
                                onclick="rejectClaim('${escapeHTML(
                    request._id ||
                    request.id
                )
                }')"
                            >
                                Reject
                            </button>

                        </div>

                    </div>

                </article>
            `;

        }).join("");
}


/* =========================================================
   APPROVE CLAIM
   ========================================================= */

async function approveClaim(
    claimId
) {

    if (!claimId) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to approve this claim?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/claims/${claimId}/approve`,
            {
                method: "PATCH"
            }
        );


        showToast(
            "Claim approved successfully.",
            "success"
        );


        await loadClaims();

        await loadVerificationRequests();


    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }
}


/* =========================================================
   REJECT CLAIM
   ========================================================= */

async function rejectClaim(
    claimId
) {

    if (!claimId) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to reject this claim?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/claims/${claimId}/reject`,
            {
                method: "PATCH"
            }
        );


        showToast(
            "Claim rejected.",
            "success"
        );


        await loadClaims();

        await loadVerificationRequests();


    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }
}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadClaims();

        loadVerificationRequests();

    }
);