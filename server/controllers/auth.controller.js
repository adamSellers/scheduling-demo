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
            if (err) {
                console.error("Authentication Error:", err);
                return next(err);
            }
            res.redirect("http://localhost:5173/dashboard");
        });
    },

    logout: (req, res, next) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            res.redirect("http://localhost:5173/");
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

            // Include the access token in the response (remove in production)
            const userInfo = {
                ...response.data,
                accessToken: req.user.accessToken,
            };

            res.json(userInfo);
        } catch (error) {
            console.error("Error fetching user info:", error);
            res.status(500).json({
                error: "Failed to fetch user information",
            });
        }
    },
};

module.exports = authController;
