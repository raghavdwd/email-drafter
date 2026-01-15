import "./src/config/env.js";
import express from "express";
// import http from "http"; // Removed http module
import cors from "cors";
import session from "express-session";
import passport from "passport";

// Routes
import authRoutes from "./src/routes/auth.route.js";
import adminRoutes from "./src/routes/admin.route.js";
import emailRoutes from "./src/routes/email.route.js";

// Database and Config
import sequelize from "./src/config/sequelize.js";
import "./src/config/passport.js";
import "./src/models/user.js";
import "./src/models/emailTemplate.js";
import "./src/models/uploadedRow.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set("trust proxy", 1);

// CORS configuration - allow multiple origins in production if needed
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Debug: Log incoming cookies
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    // console.log("📨 Incoming request:", req.method, req.path);
    // console.log("   Cookie header:", req.headers.cookie || "NO COOKIES");
    // console.log("   Origin:", req.headers.origin);
    next();
  });
}

const isProduction = process.env.NODE_ENV === "production";

// Extract domain from FRONTEND_URL for cookie domain (if same root domain)
const getCookieDomain = () => {
  if (!isProduction || !process.env.FRONTEND_URL) return undefined;

  try {
    const url = new URL(process.env.FRONTEND_URL);
    const hostname = url.hostname;

    // Only set domain if it's a proper domain (not localhost or IP)
    // For same root domain (e.g., app.example.com and api.example.com)
    // you might want to set domain to '.example.com'
    // For now, we'll let the browser handle it automatically
    return undefined;
  } catch (e) {
    return undefined;
  }
};

app.use(
  session({
    name: "connect.sid",
    secret: process.env.JWT_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    proxy: isProduction, // Only trust proxy in production
    cookie: {
      httpOnly: true,
      secure: isProduction, // Requires HTTPS in production
      sameSite: isProduction ? "none" : "lax", // 'none' requires secure: true
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: getCookieDomain(), // Set if frontend/backend share root domain
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/", emailRoutes);

//health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Create HTTP Server (optional, could just use app.listen)
// const server = http.createServer(app); // Removed http.createServer

// Sync database and start server
sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("✓ Database synced successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("✗ Database sync failed:", err);
  });
