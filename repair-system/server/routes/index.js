const express = require('express');
const router = express.Router();

// Root path response
router.get("/", (req, res) => {
  res.status(200).send("Welcome to Your Website!");
});

// Add a ping endpoint for health checks
router.get("/api/ping", (req, res) => {
  res.status(200).json({ status: "ok", message: "pong" });
});

module.exports = router;