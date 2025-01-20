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
                        process.env.NODE_ENV === "production"
                            ? "https://china-scheduler-demo-674493312f03.herokuapp.com/auth/salesforce/callback"
                            : "http://localhost:3000/auth/salesforce/callback",
                },
                function (accessToken, refreshToken, params, profile, cb) {
                    console.log("OAuth callback received:", {
                        hasAccessToken: !!accessToken,
                        hasInstanceUrl: !!params?.instance_url,
                        instanceUrl: params?.instance_url,
                    });

                    if (!params.instance_url) {
                        console.error(
                            "No instance_url received from Salesforce OAuth"
                        );
                        return cb(
                            new Error(
                                "No instance URL received from Salesforce"
                            )
                        );
                    }

                    return cb(null, {
                        accessToken,
                        refreshToken,
                        instanceUrl: params.instance_url,
                        profile,
                    });
                }
            )
        );

        passport.serializeUser((user, done) => {
            console.log("Serializing user:", {
                hasAccessToken: !!user?.accessToken,
                hasInstanceUrl: !!user?.instanceUrl,
                instanceUrl: user?.instanceUrl,
            });
            done(null, user);
        });

        passport.deserializeUser((user, done) => {
            console.log("Deserializing user:", {
                hasAccessToken: !!user?.accessToken,
                hasInstanceUrl: !!user?.instanceUrl,
                instanceUrl: user?.instanceUrl,
            });
            done(null, user);
        });
    }
}

module.exports = AuthService;
