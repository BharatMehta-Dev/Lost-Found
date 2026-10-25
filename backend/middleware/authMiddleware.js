const { auth } = require("../firebaseAdmin");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
        details: "No Firebase Bearer token was received."
      });
    }

    const token = authHeader.substring(7);
    const decodedToken = await auth.verifyIdToken(token);

    req.userId = decodedToken.uid;
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || ""
    };

    next();
  } catch (error) {
    console.error("Firebase auth error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired Firebase token.",
      details: process.env.NODE_ENV === "production" ? undefined : error.message
    });
  }
};

module.exports = protect;