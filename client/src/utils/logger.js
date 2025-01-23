class Logger {
    static LOG_LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        NONE: 4,
    };

    static level =
        process.env.NODE_ENV === "production"
            ? Logger.LOG_LEVELS.ERROR // Only show errors in production
            : Logger.LOG_LEVELS.DEBUG; // Show everything in development

    static debug(...args) {
        if (Logger.level <= Logger.LOG_LEVELS.DEBUG) {
            console.log(...args);
        }
    }

    static info(...args) {
        if (Logger.level <= Logger.LOG_LEVELS.INFO) {
            console.info(...args);
        }
    }

    static warn(...args) {
        if (Logger.level <= Logger.LOG_LEVELS.WARN) {
            console.warn(...args);
        }
    }

    static error(...args) {
        if (Logger.level <= Logger.LOG_LEVELS.ERROR) {
            console.error(...args);
        }
    }

    // For API request logging
    static logApiRequest(method, endpoint, config) {
        Logger.debug(`API Request: ${method} ${endpoint}`, config);
    }

    // For API response logging
    static logApiResponse(endpoint, response) {
        Logger.debug(`API Response from ${endpoint}:`, response);
    }

    // For API errors
    static logApiError(endpoint, error) {
        Logger.error(`API Error for ${endpoint}:`, {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
    }

    // For state updates
    static logStateUpdate(component, state) {
        Logger.debug(`${component} state updated:`, state);
    }
}

export default Logger;
