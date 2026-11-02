
const express = require("express");
const router = express.Router();

const User = require("../models/User");

// Create a user
router.post("/add", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        res.send("User added successfully!");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
