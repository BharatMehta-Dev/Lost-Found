import { uploadItemImage } from "./firebase.js";

/* =========================================================
   FOUND ITEMS
   found.js
   ========================================================= */


if (!requireLogin()) {
    throw new Error("Authentication required.");
}


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const foundItemsGrid =
    document.getElementById("foundItemsGrid");

const resultCount =
    document.getElementById("resultCount");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const categoryFilter =
    document.getElementById("categoryFilter");

const areaFilter =
    document.getElementById("areaFilter");

const locationFilter =
    document.getElementById("locationFilter");

const showFoundForm =
    document.getElementById("showFoundForm");

const closeFoundForm =
    document.getElementById("closeFoundForm");

const foundFormContainer =
    document.getElementById(
        "foundFormContainer"
    );

const foundItemForm =
    document.getElementById(
        "foundItemForm"
    );


let foundItems = [];


/* =========================================================
   LOAD FOUND ITEMS
   ========================================================= */

async function loadFoundItems() {

    if (!foundItemsGrid) {
        return;
    }


    foundItemsGrid.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">⏳</div>
            <h3>Loading found items...</h3>
            <p>Please wait.</p>
        </div>
    `;


    try {

        const data =
            await apiRequest("/found");


        foundItems =
            data.items ||
            data.foundItems ||
            data.data ||
            [];


        populateLocationFilter(
            foundItems
        );

        renderFoundItems(
            foundItems
        );


    } catch (error) {

        foundItemsGrid.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load items
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;

    }

}


/* =========================================================
   RENDER FOUND ITEMS
   ========================================================= */

function renderFoundItems(items) {

    if (!foundItemsGrid) {
        return;
    }


    if (resultCount) {

        resultCount.textContent =
            `${items.length} ${items.length === 1
                ? "item"
                : "items"
            }`;
    }


    if (!items.length) {

        foundItemsGrid.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📦
                </div>

                <h3>
                    No matching items
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>
        `;

        return;
    }


    foundItemsGrid.innerHTML =
        items.map(item => {

            return createItemCard(item);

        }).join("");
}


/* =========================================================
   ITEM CARD
   ========================================================= */

function createItemCard(item) {

    const imageHTML =
        item.image
            ? `
                <img
                    src="${escapeHTML(item.image)}"
                    alt="${escapeHTML(item.itemName)}"
                    style="
                        width:100%;
                        height:200px;
                        object-fit:cover;
                        border-radius:10px;
                        margin-bottom:18px;
                    "
                >
              `
            : `
                <div
                    style="
                        height:200px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:#f1f5f9;
                        border-radius:10px;
                        margin-bottom:18px;
                        font-size:2.5rem;
                    "
                >
                    📦
                </div>
              `;


    return `
        <article
            class="action-card"
            data-item-id="${escapeHTML(item._id || item.id)}"
        >

            ${imageHTML}

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:10px;
                    margin-bottom:10px;
                "
            >

                <span
                    style="
                        color:#2563eb;
                        font-size:0.75rem;
                        font-weight:800;
                        text-transform:uppercase;
                    "
                >
                    ${escapeHTML(item.category || "Other")}
                </span>

                <span
                    style="
                        color:#64748b;
                        font-size:0.75rem;
                    "
                >
                    ${formatDate(item.dateFound || item.createdAt)}
                </span>

            </div>


            <h3>
                ${escapeHTML(item.itemName || "Found Item")}
            </h3>


            <p style="margin-top:8px;">
                ${escapeHTML(
        item.description || "No description available."
    )}
            </p>


            <p style="margin-top:10px;">
                📍 ${escapeHTML(item.location || "Unknown")}
            </p>


            <p style="margin-top:4px;">
                ${item.areaType === "hostel" ? "🏠" : "🏫"}
                ${escapeHTML(item.areaType || "Campus")}
            </p>


            <button
                type="button"
                class="btn btn-secondary"
                style="width:100%; margin-top:18px;"
                data-action="view"
                data-item-id="${escapeHTML(item._id || item.id)}"
            >
                View Details
            </button>

            <button
                type="button"
                class="btn btn-primary"
                style="width:100%; margin-top:10px;"
                data-action="claim"
                data-item-id="${escapeHTML(item._id || item.id)}"
            >
                Claim This Item
            </button>

        </article>
    `;
}

/* =========================================================
   CLAIM MODAL CONTROLLER
   ========================================================= */

const claimModalContainer = document.getElementById("claimModalContainer");
const closeClaimModal = document.getElementById("closeClaimModal");
const cancelClaimBtn = document.getElementById("cancelClaimBtn");
const claimItemForm = document.getElementById("claimItemForm");
const claimLostItemSelect = document.getElementById("claimLostItemSelect");
const claimModalItemTitle = document.getElementById("claimModalItemTitle");
const claimTargetFoundId = document.getElementById("claimTargetFoundId");
const claimProofText = document.getElementById("claimProofText");
const claimNotesText = document.getElementById("claimNotesText");

function closeClaimModalHandler() {
    claimModalContainer?.classList.add("hidden");
    claimItemForm?.reset();
}

async function claimFoundItem(itemId) {
    const foundItem = foundItems.find((item) => (item._id || item.id) === itemId);

    let myLostItems = [];
    try {
        const response = await apiRequest("/lost/my");
        myLostItems = response.items || [];
    } catch (error) {
        showToast(error.message, "error");
        return;
    }

    if (!myLostItems.length) {
        showToast("Please report your lost item first before filing a claim.", "error");
        return;
    }

    if (claimModalItemTitle) {
        claimModalItemTitle.textContent = `Claim: ${foundItem?.itemName || "Found Item"}`;
    }

    if (claimTargetFoundId) {
        claimTargetFoundId.value = itemId;
    }

    if (claimLostItemSelect) {
        claimLostItemSelect.innerHTML = `
            <option value="">-- Select matching lost report --</option>
            ${myLostItems.map((item) => `
                <option value="${escapeHTML(item.id)}">
                    ${escapeHTML(item.itemName)} (${escapeHTML(item.category || "Item")}) - ${escapeHTML(item.lostLocation || "Campus")}
                </option>
            `).join("")}
        `;
    }

    claimModalContainer?.classList.remove("hidden");
}

if (closeClaimModal) {
    closeClaimModal.addEventListener("click", closeClaimModalHandler);
}

if (cancelClaimBtn) {
    cancelClaimBtn.addEventListener("click", closeClaimModalHandler);
}

if (claimModalContainer) {
    claimModalContainer.addEventListener("click", (event) => {
        if (event.target === claimModalContainer) {
            closeClaimModalHandler();
        }
    });
}

if (claimItemForm) {
    claimItemForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitBtn = document.getElementById("submitClaimBtn");
        const foundItemId = claimTargetFoundId?.value;
        const lostItemId = claimLostItemSelect?.value;
        const proof = claimProofText?.value.trim();
        const notes = claimNotesText?.value.trim() || "";

        if (!foundItemId || !lostItemId) {
            showToast("Please select your matching lost report.", "error");
            return;
        }

        if (!proof) {
            showToast("Please provide proof of ownership.", "error");
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting Claim...";
        }

        try {
            await apiRequest("/claims", {
                method: "POST",
                body: JSON.stringify({
                    foundItemId,
                    lostItemId,
                    proof,
                    notes
                })
            });

            showToast("Claim submitted successfully! The finder will review it.", "success");
            closeClaimModalHandler();
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit Claim";
            }
        }
    });
}

window.claimFoundItem = claimFoundItem;



/* =========================================================
   SEARCH & FILTER
   ========================================================= */

function filterFoundItems() {

    const searchTerm =
        (searchInput?.value || "")
            .trim()
            .toLowerCase();


    const category =
        categoryFilter?.value || "";


    const area =
        areaFilter?.value || "";


    const location =
        locationFilter?.value || "";


    const filtered =
        foundItems.filter(item => {

            const searchableText = [

                item.itemName,

                item.category,

                item.brand,

                item.color,

                item.description,

                item.location

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !searchTerm ||
                searchableText.includes(searchTerm);


            const matchesCategory =
                !category ||
                item.category === category;


            const matchesArea =
                !area ||
                item.areaType === area;


            const matchesLocation =
                !location ||
                item.location === location;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesArea &&
                matchesLocation
            );
        });


    renderFoundItems(filtered);
}


/* =========================================================
   LOCATION FILTER
   ========================================================= */

function populateLocationFilter(items) {

    if (!locationFilter) {
        return;
    }


    const locations =
        [
            ...new Set(
                items
                    .map(item => item.location)
                    .filter(Boolean)
            )
        ]
            .sort();


    locationFilter.innerHTML = `
        <option value="">
            All Locations
        </option>
    `;


    locations.forEach(location => {

        const option =
            document.createElement("option");

        option.value = location;

        option.textContent = location;

        locationFilter.appendChild(option);

    });
}


/* =========================================================
   VIEW FOUND ITEM
   ========================================================= */

async function viewFoundItem(itemId) {

    if (!itemId) {
        return;
    }


    try {

        const data =
            await apiRequest(
                `/found/${itemId}`
            );


        const item =
            data.item ||
            data;


        /*
           For now we display the details through
           a simple browser dialog.

           Later we'll create a proper item-details.html
           or modal.
        */

        const details = [

            `Item: ${item.itemName || "Unknown"}`,

            `Category: ${item.category || "Unknown"}`,

            `Brand: ${item.brand || "Not specified"}`,

            `Color: ${item.color || "Not specified"}`,

            `Location: ${item.location || "Unknown"}`,

            `Date Found: ${formatDate(item.dateFound)}`,

            "",

            item.description || "No description available."

        ].join("\n");


        alert(details);


    } catch (error) {

        showToast(
            error.message,
            "error"
        );
    }
}

window.viewFoundItem = viewFoundItem;

foundItemsGrid?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const itemId = button.dataset.itemId;
    if (button.dataset.action === "view") {
        viewFoundItem(itemId);
    } else if (button.dataset.action === "claim") {
        claimFoundItem(itemId);
    }
});


/* =========================================================
   MODAL OPEN/CLOSE
   ========================================================= */

if (showFoundForm) {

    showFoundForm.addEventListener(
        "click",
        () => {

            foundFormContainer?.classList.remove(
                "hidden"
            );

        }
    );
}


if (closeFoundForm) {

    closeFoundForm.addEventListener(
        "click",
        () => {

            foundFormContainer?.classList.add(
                "hidden"
            );

        }
    );
}


if (foundFormContainer) {

    foundFormContainer.addEventListener(
        "click",
        (event) => {

            if (
                event.target === foundFormContainer
            ) {

                foundFormContainer.classList.add(
                    "hidden"
                );

            }

        }
    );
}


/* =========================================================
   SUBMIT FOUND ITEM
   ========================================================= */

if (foundItemForm) {

    foundItemForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const submitButton =
                foundItemForm.querySelector(
                    "button[type='submit']"
                );


            const itemName =
                document.getElementById(
                    "foundItemName"
                ).value.trim();

            const category =
                document.getElementById(
                    "foundCategory"
                ).value;

            const brand =
                document.getElementById(
                    "foundBrand"
                ).value.trim();

            const color =
                document.getElementById(
                    "foundColor"
                ).value.trim();

            const description =
                document.getElementById(
                    "foundDescription"
                ).value.trim();

            const areaType =
                document.getElementById(
                    "foundAreaType"
                ).value;

            const location =
                document.getElementById(
                    "foundLocation"
                ).value.trim();

            const date =
                document.getElementById(
                    "foundDate"
                ).value;

            const time =
                document.getElementById(
                    "foundTime"
                ).value;

            const imageInput =
                document.getElementById(
                    "foundImage"
                );


            if (
                !itemName ||
                !category ||
                !description ||
                !areaType ||
                !location ||
                !date
            ) {

                showToast(
                    "Please fill in all required fields.",
                    "error"
                );

                return;
            }


            submitButton.disabled = true;

            submitButton.textContent =
                "Submitting...";


            try {
                const imageUrl = await uploadItemImage(
                    imageInput?.files?.[0],
                    "found-items"
                );

                const data =
                    await apiRequest(
                        "/found",
                        {
                            method: "POST",
                            body: JSON.stringify({
                                itemName,
                                category,
                                brand,
                                color,
                                description,
                                areaType,
                                location,
                                dateFound: date,
                                timeFound: time,
                                image: imageUrl
                            })
                        }
                    );


                showToast(
                    data.message ||
                    "Found item reported successfully.",
                    "success"
                );


                foundItemForm.reset();

                foundFormContainer?.classList.add(
                    "hidden"
                );


                await loadFoundItems();


            } catch (error) {

                showToast(
                    error.message,
                    "error"
                );

            } finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Submit Found Report";
            }

        }
    );
}


/* =========================================================
   SEARCH EVENTS
   ========================================================= */

searchInput?.addEventListener(
    "input",
    filterFoundItems
);

searchButton?.addEventListener(
    "click",
    filterFoundItems
);

categoryFilter?.addEventListener(
    "change",
    filterFoundItems
);

areaFilter?.addEventListener(
    "change",
    filterFoundItems
);

locationFilter?.addEventListener(
    "change",
    filterFoundItems
);


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    loadFoundItems
);