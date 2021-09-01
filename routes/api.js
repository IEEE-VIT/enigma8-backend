//  /api/*
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.send("This is the API endpoint");
});

module.exports = router;
