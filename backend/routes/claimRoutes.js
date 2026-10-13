const express = require("express");
const {
  createClaim,
  getClaims,
  getVerificationRequests,
  approveClaim,
  rejectClaim
} = require("../controllers/claimController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(getClaims).post(createClaim);
router.route("/verification").get(getVerificationRequests);
router.route("/:id/approve").patch(approveClaim);
router.route("/:id/reject").patch(rejectClaim);

module.exports = router;