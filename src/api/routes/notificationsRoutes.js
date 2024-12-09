// Route: routes/notifications.js

const express = require("express");
const {
  getDetailedBadgeStatus,
} = require("../controllers/notificationsController");
const router = express.Router();

router.get("/users/:userId/detailed-badge-status", getDetailedBadgeStatus);

module.exports = router;
