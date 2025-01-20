const cors = require("cors");

class CorsConfig {
    static initialize(app) {
        const allowedOrigins = [
            "https://china-scheduler-demo-674493312f03.herokuapp.com",
            "http://localhost:5173", // Keep local development
        ];

        app.use(
            cors({
                origin: function (origin, callback) {
                    // Allow requests with no origin (like mobile apps or curl requests)
                    if (!origin) return callback(null, true);

                    if (allowedOrigins.indexOf(origin) === -1) {
                        console.warn(
                            `Request from unauthorized origin: ${origin}`
                        );
                        // In production, we're more permissive to avoid CORS issues
                        if (process.env.NODE_ENV === "production") {
                            return callback(null, true);
                        }
                        const msg =
                            "The CORS policy for this site does not allow access from the specified Origin.";
                        return callback(new Error(msg), false);
                    }
                    return callback(null, true);
                },
                credentials: true,
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                allowedHeaders: ["Content-Type", "Authorization"],
                exposedHeaders: ["set-cookie"],
            })
        );
    }
}

module.exports = CorsConfig;
