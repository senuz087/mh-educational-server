// 👻 MH Educational Real-Time Server
// Generates safe random data for learning purposes only.

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

// Demo data generator (safe, no gambling behavior)
function generateData() {
    return {
        time: new Date().toLocaleTimeString(),
        value: (Math.random() * 50 + 10).toFixed(2), // random number 10 - 60
        confidence: 99,  // static demo
        status: "Running"
    };
}

// API endpoint
app.get("/api/live", (req, res) => {
    res.json(generateData());
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server LIVE on http://localhost:${PORT}/api/live`);
});
