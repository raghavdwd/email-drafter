import express from "express";
import cors from "cors";
import authRoutes from "../routes/auth.route.js";
import adminRoutes from "../routes/admin.route.js";

const app = express();
app.use(cors());
app.use(express.json());

// creating server routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

export default app;