const express = require("express");

const {
  createFoundItem,
  getFoundItems,
  getFoundItemById
} = require("../controllers/foundController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getFoundItems)
  .post(createFoundItem);

router.route("/:id").get(getFoundItemById);

module.exports = router;