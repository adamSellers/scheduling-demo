// services/auth.service.js
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
                function (accessToken, refreshToken, profile, cb) {
                    // Add script to send token to browser console
                    const consoleScript = `
                        <script>
                            console.log('Salesforce Access Token:', '${accessToken}');
                        </script>
                    `;

                    return cb(null, {
                        accessToken,
                        refreshToken,
                        profile,
                        consoleScript,
                    });
                }
            )
        );

        this.initializeSerializers();
    }

    static initializeSerializers() {
        passport.serializeUser((user, done) => {
            console.log("Serializing user:", user);
            done(null, user);
        });

        passport.deserializeUser((user, done) => {
            console.log("Deserializing user:", user);
            done(null, user);
        });
    }
}

module.exports = AuthService;
