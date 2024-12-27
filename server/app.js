const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const AuthService = require("./services/auth.service");
const PassportConfig = require("./config/passport.config");
const CorsConfig = require("./config/cors.config");
require("dotenv").config();

const indexRouter = require("./routes/index");
const authRoutes = require("./routes/auth.routes");
const schedulerRoutes = require("./routes/scheduler.routes");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
CorsConfig.initialize(app);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
PassportConfig.initialize(app);
AuthService.initializePassport();
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log("Incoming request:", {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
    });
    next();
});

// Route definitions
app.use("/", indexRouter);
app.use("/auth", authRoutes);
app.use("/api/scheduler", schedulerRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    console.error("Error:", err);

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
