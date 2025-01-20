const session = require("express-session");
const passport = require("passport");

class PassportConfig {
    static initialize(app) {
        app.use(
            session({
                secret: process.env.SESSION_SECRET || "your-secret-key",
                resave: false,
                saveUninitialized: false,
                proxy: true, // Required for Heroku SSL
                cookie: {
                    secure: process.env.NODE_ENV === "production",
                    sameSite:
                        process.env.NODE_ENV === "production" ? "none" : "lax",
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                    httpOnly: true,
                },
            })
        );
        app.use(passport.initialize());
        app.use(passport.session());
    }
}

module.exports = PassportConfig;
