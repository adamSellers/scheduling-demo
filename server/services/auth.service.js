const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");

class AuthService {
    static initializePassport() {
        passport.use(
            "salesforce",
            new OAuth2Strategy(
                {
                    authorizationURL: `${process.env.SF_LOGIN_URL}/services/oauth2/authorize`,
                    tokenURL: `${process.env.SF_LOGIN_URL}/services/oauth2/token`,
                    clientID: process.env.SF_CLIENT_ID,
                    clientSecret: process.env.SF_CLIENT_SECRET,
                    callbackURL:
                        "http://localhost:3000/auth/salesforce/callback",
                },
                function (accessToken, refreshToken, params, profile, cb) {
                    console.log(`Access token: ${accessToken}`);
                    console.log(`Instance URL: ${params.instance_url}`);
                    return cb(null, {
                        accessToken,
                        refreshToken,
                        instanceUrl: params.instance_url,
                        profile,
                    });
                }
            )
        );

        passport.serializeUser((user, done) => done(null, user));
        passport.deserializeUser((user, done) => done(null, user));
    }
}

module.exports = AuthService;
