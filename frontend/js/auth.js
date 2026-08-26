/* =========================================================
   AUTHENTICATION
   auth.js
   ========================================================= */


/* =========================================================
   1. INSTITUTE EMAIL VALIDATION
   ========================================================= */

function validateInstituteEmail(email) {

    /*
       IMPORTANT:
       Replace this with your actual institute domain.

       Example:
       @mitsgwalior.in

       For now we allow common college-style domains.
    */

    const allowedDomains = [
        ".mitsgwl.ac.in",
        "mitsgwalior.in",
        ".ac.in",
        ".in",
        ".college"
    ];

    const lowerEmail = email.toLowerCase();

    return allowedDomains.some(domain =>
        lowerEmail.endsWith(domain)
    );
}


/* =========================================================
   2. GOOGLE AUTHENTICATION
   ========================================================= */

const googleAuthButtons = document.querySelectorAll(
    "#googleSignupButton, #googleLoginButton"
);

googleAuthButtons.forEach(button => {
    button.addEventListener("click", () => {
        showToast(
            "Google sign-in is not configured yet. Please use the form above.",
            "error"
        );
    });
});


/* =========================================================
   3. SIGNUP
   ========================================================= */

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const department =
            document.getElementById("department").value;

        const year =
            document.getElementById("year").value;

        const hostel =
            document.getElementById("hostel").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        /* Validation */

        if (!name || !email || !department || !year || !password) {

            showToast(
                "Please fill in all required fields.",
                "error"
            );

            return;
        }


        if (!validateInstituteEmail(email)) {

            showToast(
                "Please use your valid institute email.",
                "error"
            );

            return;
        }


        if (password.length < 8) {

            showToast(
                "Password must contain at least 8 characters.",
                "error"
            );

            return;
        }


        if (password !== confirmPassword) {

            showToast(
                "Passwords do not match.",
                "error"
            );

            return;
        }


        const submitButton =
            signupForm.querySelector("button[type='submit']");

        submitButton.disabled = true;

        submitButton.textContent =
            "Creating Account...";


        try {

            const data = await apiRequest(
                "/auth/register",
                {
                    method: "POST",

                    body: JSON.stringify({
                        name,
                        email,
                        department,
                        year,
                        hostel,
                        password
                    })
                }
            );


            showToast(
                data.message ||
                "Account created successfully.",
                "success"
            );


            /*
               Your backend may later require email verification.
               If so, redirect to verification.html instead.
            */

            setTimeout(() => {

                window.location.href = "login.html";

            }, 1200);


        } catch (error) {

            showToast(
                error.message,
                "error"
            );

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "Sign Up";
        }

    });
}


/* =========================================================
   3. LOGIN
   ========================================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        if (!email || !password) {

            showToast(
                "Please enter your email and password.",
                "error"
            );

            return;
        }


        const submitButton =
            loginForm.querySelector("button[type='submit']");

        submitButton.disabled = true;

        submitButton.textContent =
            "Logging in...";


        try {

            const data = await apiRequest(
                "/auth/login",
                {
                    method: "POST",

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            /*
               Expected backend response:

               {
                   token: "...",
                   user: {...}
               }
            */

            if (!data.token) {

                throw new Error(
                    "Login response did not contain an authentication token."
                );
            }


            setToken(data.token);


            if (data.user) {
                setStoredUser(data.user);
            }


            showToast(
                "Login successful.",
                "success"
            );


            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 700);


        } catch (error) {

            showToast(
                error.message,
                "error"
            );

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "Login";
        }

    });
}