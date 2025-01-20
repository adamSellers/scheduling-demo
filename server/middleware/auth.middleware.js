class AuthMiddleware {
    static isAuthenticated(req, res, next) {
        console.log("Auth check:", {
            isAuthenticated: req.isAuthenticated(),
            hasSession: !!req.session,
            hasUser: !!req.user,
            sessionID: req.sessionID,
            cookies: req.headers.cookie,
        });

        if (req.isAuthenticated()) {
            return next();
        }
        res.status(401).json({ error: "Not authenticated" });
    }
}

module.exports = AuthMiddleware;
