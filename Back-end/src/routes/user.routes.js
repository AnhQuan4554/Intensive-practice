const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// CREATE a new device
router.post("/create", userController.createNew);
router.get("/", (req, res) => {
  res.send("okoko");
});

module.exports = router;
