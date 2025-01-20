const passport = require("passport");
const axios = require("axios");

const authController = {
    initiateAuth: (req, res, next) => {
        passport.authenticate("salesforce", {
            scope: ["api", "refresh_token"],
        })(req, res, next);
    },

    handleCallback: (req, res, next) => {
        passport.authenticate("salesforce", {
            failureRedirect: "/login",
            session: true,
        })(req, res, (err) => {
            if (err) return next(err);

            // Ensure session is saved before redirect
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return next(err);
                }
                console.log("Session saved successfully:", {
                    sessionID: req.sessionID,
                    hasUser: !!req.user,
                });

                res.redirect(
                    process.env.NODE_ENV === "production"
                        ? "https://china-scheduler-demo-674493312f03.herokuapp.com/dashboard"
                        : "http://localhost:5173/dashboard"
                );
            });
        });
    },

    logout: (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            const redirectUrl =
                process.env.NODE_ENV === "production"
                    ? "https://china-scheduler-demo-674493312f03.herokuapp.com/"
                    : "http://localhost:5173/";
            res.redirect(redirectUrl);
        });
    },

    getUserInfo: async (req, res) => {
        if (!req.user?.accessToken) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        try {
            const response = await axios.get(
                `${process.env.SF_LOGIN_URL}/services/oauth2/userinfo`,
                {
                    headers: {
                        Authorization: `Bearer ${req.user.accessToken}`,
                    },
                }
            );

            res.json({
                ...response.data,
                accessToken: req.user.accessToken,
            });
        } catch (error) {
            console.error("Error fetching user info:", error);
            res.status(500).json({
                error: "Failed to fetch user information",
                details: error.message,
            });
        }
    },
};

module.exports = authController;
