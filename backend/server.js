// server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import dns from "dns";

import authRoutes from "./routes/authRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import accountsRoutes from "./routes/accountsRoutes.js";
import transfersRoutes from "./routes/transfersRoutes.js";
import adminTransfersRoutes from "./routes/adminTransfersRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";
import depositsRoutes from "./routes/depositsRoutes.js";
import adminDepositsRoutes from "./routes/adminDepositsRoutes.js";
import transactionsRoutes from "./routes/transactionsRoutes.js";
import adminReportsRoutes from "./routes/adminReportsRoutes.js";
import statementsRoutes from "./routes/statementsRoutes.js";              // ⬅️ NEW
import adminStatementsRoutes from "./routes/adminStatementsRoutes.js";    // ⬅️ NEW
import cardsRoutes from './routes/cardsRoutes.js';
import adminCardsRoutes from './routes/adminCardsRoutes.js';

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

// DNS fix only for local dev
if (!process.env.VERCEL) {
  try {
    dns.setDefaultResultOrder("ipv4first");
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // ignore
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://www.thegulfcoasttrust.com",
  "https://thegulfcoasttrust.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked origin:", origin);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Health check — no DB required
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Backend is reachable",
    env: process.env.VERCEL ? "vercel" : "local",
    time: new Date().toISOString(),
  });
});

// MongoDB connection cached for serverless
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not set in environment variables");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URL, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// DB middleware — scoped to /api ONLY
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ Mongo connection error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/transfers", transfersRoutes);
app.use("/api/admin/transfers", adminTransfersRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/deposits", depositsRoutes);
app.use("/api/admin/deposits", adminDepositsRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/admin/reports", adminReportsRoutes);
app.use("/api/statements", statementsRoutes);                          // ⬅️ NEW
app.use("/api/admin/statements", adminStatementsRoutes);               // ⬅️ NEW
app.use("/api/cards", cardsRoutes);                                   // ⬅️ NEW
app.use("/api/admin/cards", adminCardsRoutes);                        // ⬅️ NEW

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Local / Render listener
if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      console.log("✅ Connected to MongoDB");
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ Mongo error:", err.message);
      process.exit(1);
    });
}

export default app;