const express = require("express");
const { GoogleAuth } = require("google-auth-library");
const app = express();
const port = 3000;

const auth = new GoogleAuth({
  keyFile: "./serviceAccountKey.json",
  scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
});

app.get("/get-fcm-token", async (req, res) => {
  try {
    const accessToken = await auth.getAccessToken();
    res.json({ token: accessToken });
  } catch (err) {
    console.error("Error getting token:", err);
    res.status(500).json({ error: "Failed to get access token" });
  }
});

app.listen(port, () => {
  console.log(`Token server running at http://localhost:${port}`);
});
