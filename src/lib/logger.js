/**
 * Simple logging utility for the application
 * Provides structured logging with different log levels
 */

const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

const LOG_COLORS = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m',  // Yellow
    INFO: '\x1b[36m',  // Cyan
    DEBUG: '\x1b[90m', // Gray
    RESET: '\x1b[0m'
};

class Logger {
    constructor(context = 'App') {
        this.context = context;
        this.isDevelopment = process.env.NODE_ENV !== 'production';
    }

    _formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const color = LOG_COLORS[level] || '';
        const reset = LOG_COLORS.RESET;

        return {
            timestamp,
            level,
            context: this.context,
            message,
            ...meta
        };
    }

    _log(level, message, meta = {}) {
        const logData = this._formatMessage(level, message, meta);
        const color = LOG_COLORS[level] || '';
        const reset = LOG_COLORS.RESET;

        // In production, only log warnings and errors
        // if (!this.isDevelopment && (level === LOG_LEVELS.DEBUG || level === LOG_LEVELS.INFO)) {
        //     return;
        // }

        // Console output with color
        const prefix = `${color}[${logData.timestamp}] [${level}] [${this.context}]${reset}`;

        if (level === LOG_LEVELS.ERROR) {
            console.error(prefix, message, meta);
        } else if (level === LOG_LEVELS.WARN) {
            console.warn(prefix, message, meta);
        } else {
            console.log(prefix, message, meta);
        }
    }

    error(message, error = null) {
        const meta = error ? {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            }
        } : {};
        this._log(LOG_LEVELS.ERROR, message, meta);
    }

    warn(message, meta = {}) {
        this._log(LOG_LEVELS.WARN, message, meta);
    }

    info(message, meta = {}) {
        this._log(LOG_LEVELS.INFO, message, meta);
    }

    debug(message, meta = {}) {
        this._log(LOG_LEVELS.DEBUG, message, meta);
    }

    // Create a child logger with additional context
    child(childContext) {
        return new Logger(`${this.context}:${childContext}`);
    }
}

// Create default logger instance
export const logger = new Logger('App');

// Export Logger class for custom instances
export default Logger;
