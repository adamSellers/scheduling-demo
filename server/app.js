const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const { createClient } = require("@redis/client");
const { RedisStore } = require("connect-redis");
const AuthService = require("./services/auth.service");
const CorsConfig = require("./config/cors.config");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const schedulerRoutes = require("./routes/scheduler.routes");
const customerRoutes = require("./routes/customer.routes");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Basic middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS configuration must be before session
CorsConfig.initialize(app);

// Redis setup
const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
        tls: process.env.NODE_ENV === "production",
        rejectUnauthorized: false,
    },
});

redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
    console.log("Connected to Redis successfully");
});

redisClient.connect().catch(console.error);

// Session configuration
const redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
});

app.use(
    session({
        store: redisStore,
        secret: process.env.SESSION_SECRET || "your-secret-key",
        name: "sessionId",
        resave: false,
        saveUninitialized: false,
        proxy: true,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            httpOnly: true,
        },
    })
);

// Initialize passport
AuthService.initializePassport();
app.use(require("passport").initialize());
app.use(require("passport").session());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log("Incoming request:", {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        session: req.session ? "exists" : "missing",
        sessionID: req.sessionID,
    });
    next();
});

// Route definitions
app.use("/auth", authRoutes);
app.use("/api/scheduler", schedulerRoutes);
app.use("/api/customers", customerRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));

    app.get("*", (req, res) => {
        if (!req.url.startsWith("/api") && !req.url.startsWith("/auth")) {
            res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
        }
    });
} else {
    app.use(express.static(path.join(__dirname, "public")));
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    console.error("Error:", err);
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});

// Cleanup on app shutdown
process.on("SIGTERM", () => {
    redisClient.quit();
});

module.exports = app;
