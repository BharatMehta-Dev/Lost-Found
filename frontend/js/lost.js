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
                "Submitting...";


            try {

                /*
                   FormData is used because we may upload
                   an image along with the report.
                */

                const formData = new FormData();

                formData.append(
                    "itemName",
                    itemName
                );

                formData.append(
                    "category",
                    category
                );

                formData.append(
                    "brand",
                    brand
                );

                formData.append(
                    "color",
                    color
                );

                formData.append(
                    "description",
                    description
                );

                formData.append(
                    "areaType",
                    areaType
                );

                formData.append(
                    "location",
                    location
                );

                formData.append(
                    "lostDate",
                    lostDate
                );

                formData.append(
                    "lostTime",
                    lostTime
                );

                formData.append(
                    "privateDetails",
                    privateDetails
                );


                if (
                    imageInput &&
                    imageInput.files.length > 0
                ) {

                    formData.append(
                        "image",
                        imageInput.files[0]
                    );
                }


                const data =
                    await apiRequest(
                        "/lost",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                showToast(
                    data.message ||
                    "Lost item reported successfully.",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 1000);


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