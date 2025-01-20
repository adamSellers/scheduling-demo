const passport = require("passport");

class PassportConfig {
    static initialize(app) {
        app.use(passport.initialize());
        app.use(passport.session());
    }
}

module.exports = PassportConfig;
