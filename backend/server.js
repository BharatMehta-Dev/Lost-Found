const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const lostRoutes = require("./routes/lostRoutes");
const foundRoutes = require("./routes/foundRoutes");
const claimRoutes = require("./routes/claimRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
require("./firebaseAdmin");
const protect = require("./middleware/authMiddleware");
const { getDashboard } = require("./controllers/dashboardController");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lost", lostRoutes);
app.use("/api/found", foundRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/api/dashboard", protect, getDashboard);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Lost & Found API is running" });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong on the server."
  });
});

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;