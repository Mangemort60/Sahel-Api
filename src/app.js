require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const authRoutes = require("./api/routes/authRoutes");
const quoteRoutes = require("./api/routes/quoteRoutes");
const paymentRoutes = require("./api/routes/paymentRoutes");
const reservationRoutes = require("./api/routes/reservationRoutes");
const chatRoutes = require("./api/routes/chatRoutes");
const contactRoutes = require("./api/routes/contactRoutes");
const helmet = require("helmet");

app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:4173",
      "http://localhost:5173",
      "http://localhost:3000",
      "https://sahel-back-286afc7b2555.herokuapp.com",
      "https://sahel-26e16.web.app",
      "https://sahel-admin.web.app",
      "https://sahel-26e16.firebaseapp.com",
      "https://sahel-admin.firebaseapp.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Traiter les requêtes preflight OPTIONS globalement
app.options("*", cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/auth", authRoutes);
app.use("/", quoteRoutes);
app.use("/", reservationRoutes);
app.use("/", paymentRoutes);
app.use("/", chatRoutes);
app.use("/", contactRoutes);

module.exports = app;
