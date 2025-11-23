const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is running.");
});

app.post("/submit", async (req, res) => {
    const { userId, questionId, answer, timestamp } = req.body;

    if (!userId || !questionId || !answer) {
        return res.status(400).json({ error: "Missing fields." });
    }

    try {
        await appendToSheet([userId, questionId, answer, timestamp]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save." });
    }
});


async function appendToSheet(row) {
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID,
        range: "Responses!A:D",
        valueInputOption: "RAW",
        resource: { values: [row] }
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
