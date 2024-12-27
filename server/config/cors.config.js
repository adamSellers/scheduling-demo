const cors = require("cors");

class CorsConfig {
    static initialize(app) {
        app.use(
            cors({
                origin: process.env.CLIENT_URL || "http://localhost:5173",
                credentials: true,
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                allowedHeaders: ["Content-Type", "Authorization"],
            })
        );
    }
}

module.exports = CorsConfig;
