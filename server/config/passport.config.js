const session = require("express-session");
const passport = require("passport");

class PassportConfig {
    static initialize(app) {
        app.use(
            session({
                secret: process.env.SESSION_SECRET || "your-secret-key",
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                },
            })
        );
        app.use(passport.initialize());
        app.use(passport.session());
    }
}

module.exports = PassportConfig;
