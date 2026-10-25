const { auth, db } = require("../firebaseAdmin");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, department, year, hostel } = req.body;

    if (!name || !email || !password || !department || !year) {
      return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must contain at least 6 characters." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const collegeDomain = process.env.COLLEGE_EMAIL_DOMAIN;

    if (collegeDomain && !cleanEmail.endsWith(collegeDomain.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Please use your institute email address." });
    }

    const firebaseUser = await auth.createUser({
      email: cleanEmail,
      password,
      displayName: name.trim()
    });

    const profile = {
      name: name.trim(),
      email: cleanEmail,
      department: department.trim(),
      year: year.trim(),
      hostel: hostel?.trim() || "",
      profileImage: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection("users").doc(firebaseUser.uid).set(profile);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: { id: firebaseUser.uid, ...profile }
    });
  } catch (error) {
    console.error("Register error:", error);
    const status = error.code === "auth/email-already-exists" ? 409 : 500;
    return res.status(status).json({
      success: false,
      message: status === 409 ? "An account with this email already exists." : "Server error while creating account."
    });
  }
};

const loginUser = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Use Firebase Authentication on the frontend to log in."
  });
};

module.exports = { registerUser, loginUser };
