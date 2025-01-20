const session = require("express-session");
const passport = require("passport");
const RedisStore = require("connect-redis").default;
const { createClient } = require("@redis/client");

class PassportConfig {
    static async initialize(app) {
        // Initialize Redis client with SSL configuration
        const redisClient = createClient({
            url: process.env.REDIS_URL || "redis://localhost:6379",
            socket: {
                tls: process.env.NODE_ENV === "production",
                rejectUnauthorized: false, // Required for Heroku Redis SSL
            },
        });

        // Redis error handling
        redisClient.on("error", (err) => {
            console.error("Redis Client Error:", err);
            if (process.env.NODE_ENV === "production") {
                console.error("Production Redis error:", err);
            }
        });

        redisClient.on("connect", () => {
            console.log("Connected to Redis successfully");
        });

        redisClient.on("reconnecting", () => {
            console.log("Redis client reconnecting...");
        });

        redisClient.on("ready", () => {
            console.log("Redis client ready");
        });

        // Connect to Redis
        try {
            await redisClient.connect();
        } catch (error) {
            console.error("Failed to connect to Redis:", error);
            if (process.env.NODE_ENV === "production") {
                console.error("Full Redis connection error:", error);
                process.exit(1);
            }
        }

        // Initialize Redis store with connected client
        const redisStore = new RedisStore({
            client: redisClient,
            prefix: "sess:",
        });

        app.use(
            session({
                store: redisStore,
                secret: process.env.SESSION_SECRET || "your-secret-key",
                resave: false,
                saveUninitialized: false,
                proxy: true, // Required for Heroku SSL
                cookie: {
                    secure: process.env.NODE_ENV === "production",
                    sameSite:
                        process.env.NODE_ENV === "production" ? "none" : "lax",
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                    httpOnly: true,
                },
            })
        );
        app.use(passport.initialize());
        app.use(passport.session());

        // Cleanup function for graceful shutdown
        const cleanup = async () => {
            try {
                await redisClient.quit();
                console.log("Redis connection closed.");
            } catch (err) {
                console.error("Error closing Redis connection:", err);
            }
        };

        // Handle application shutdown
        process.on("SIGTERM", cleanup);
        process.on("SIGINT", cleanup);

        return redisClient; // Return client for potential external use
    }
}

module.exports = PassportConfig;
