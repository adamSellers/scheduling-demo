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
                    sameSite: "none",
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                    domain:
                        process.env.NODE_ENV === "production"
                            ? ".herokuapp.com"
                            : undefined,
                },
            })
        );
        app.use(passport.initialize());
        app.use(passport.session());
    }
}

module.exports = PassportConfig;
