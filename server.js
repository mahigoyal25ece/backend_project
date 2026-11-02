const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected!"))
.catch((err) => console.log(err));

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to my Backend Tutorial!");
});

// About route
app.get("/about", (req, res) => {
    res.send("This is my first backend API!");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});