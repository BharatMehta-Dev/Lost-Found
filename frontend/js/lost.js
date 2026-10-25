import { uploadItemImage } from "./firebase.js";

/* =========================================================
   LOST ITEMS
   lost.js
   ========================================================= */


if (!requireLogin()) {
    throw new Error("Authentication required.");
}


const lostItemForm =
    document.getElementById("lostItemForm");


/* =========================================================
   SUBMIT LOST ITEM
   ========================================================= */

if (lostItemForm) {

    lostItemForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const submitButton =
                lostItemForm.querySelector(
                    "button[type='submit']"
                );


            /* Get values */

            const itemName =
                document.getElementById(
                    "itemName"
                ).value.trim();

            const category =
                document.getElementById(
                    "category"
                ).value;

            const brand =
                document.getElementById(
                    "brand"
                ).value.trim();

            const color =
                document.getElementById(
                    "color"
                ).value.trim();

            const description =
                document.getElementById(
                    "description"
                ).value.trim();

            const areaType =
                document.getElementById(
                    "areaType"
                ).value;

            const location =
                document.getElementById(
                    "location"
                ).value.trim();

            const lostDate =
                document.getElementById(
                    "lostDate"
                ).value;

            const lostTime =
                document.getElementById(
                    "lostTime"
                ).value;

            const privateDetails =
                document.getElementById(
                    "privateDetails"
                ).value.trim();

            const imageInput =
                document.getElementById(
                    "itemImage"
                );


            /* Validation */

            if (
                !itemName ||
                !category ||
                !description ||
                !areaType ||
                !location ||
                !lostDate
            ) {

                showToast(
                    "Please fill in all required fields.",
                    "error"
                );

                return;
            }


            submitButton.disabled = true;

            submitButton.textContent =
                imageInput?.files?.[0] ? "Optimizing image..." : "Submitting...";


            try {
                const imageUrl = await uploadItemImage(
                    imageInput?.files?.[0],
                    "lost-items"
                );

                submitButton.textContent = "Saving report...";

                const data =
                    await apiRequest(
                        "/lost",
                        {
                            method: "POST",
                            body: JSON.stringify({
                                itemName,
                                category,
                                brand,
                                color,
                                description,
                                campus: areaType,
                                lostLocation: location,
                                lostDate,
                                lostTime,
                                privateDetails,
                                image: imageUrl
                            })
                        }
                    );


                showToast(
                    data.message ||
                    "Lost item reported successfully.",
                    "success"
                );


                setTimeout(() => {

                    window.location.href = "dashboard.html";

                }, 400);


            } catch (error) {

                showToast(
                    error.message,
                    "error"
                );

            } finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Submit Lost Report";
            }

        }
    );
}