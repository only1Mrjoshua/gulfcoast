import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import dns from "dns";

import authRoutes from "./routes/authRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import accountsRoutes from './routes/accountsRoutes.js';
import transfersRoutes from './routes/transfersRoutes.js';
import adminTransfersRoutes from './routes/adminTransfersRoutes.js';
import paymentsRoutes from './routes/paymentsRoutes.js';
import depositsRoutes from './routes/depositsRoutes.js';
import adminDepositsRoutes from './routes/adminDepositsRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';
import adminReportsRoutes from './routes/adminReportsRoutes.js';


import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

// ✅ Fix DNS SRV resolution issues on Windows/VPN setups
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

// ✅ Parse JSON with increased limit for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ✅ CORS configuration 
const allowedOrigins = [
  'http://localhost:5173', // Vite default
  'http://127.0.0.1:5173',
  'https://www.thegulfcoasttrust.com',
  'https://thegulfcoasttrust.com'
  // Add your production frontend URLs here later
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Health test endpoint
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is reachable" });
});

// ✅ Routes
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

// ✅ Error middleware order (notFound first)
app.use(notFound);
app.use(errorHandler);

// ✅ Mongo + server start
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`✅ Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ Mongo error:", err.message));