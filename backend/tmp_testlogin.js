process.env.DOTENV_CONFIG_QUIET = "true";
require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
app.use((err, req, res, next) => {
  console.log("ERROR STACK:", err.stack || err);
  res.status(500).json({ message: "err" });
});
const http = require("http");
const server = http.createServer(app);
server.listen(3998, async () => {
  try {
    const login = await fetch("http://localhost:3998/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "testlandlord@test.com", password: "123456" }),
    });
    console.log("STATUS:", login.status);
    console.log("BODY:", await login.text());
  } catch (e) {
    console.log("FETCH ERR:", e.message);
  }
  process.exit(0);
});
