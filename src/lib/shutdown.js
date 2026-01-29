import mongoose from 'mongoose';
import Logger from '@/lib/logger';

const logger = new Logger('Shutdown');

let isShuttingDown = false;

export async function gracefulShutdown(signal) {
    if (isShuttingDown) {
        return;
    }
    
    isShuttingDown = true;
    logger.info(`${signal} received, starting graceful shutdown...`);

    try {
        // Close MongoDB connections
        await mongoose.connection.close(false);
        logger.info('MongoDB connections closed');

        // Give time for pending requests to complete
        await new Promise(resolve => setTimeout(resolve, 5000));

        logger.info('Graceful shutdown completed');
        process.exit(0);
    } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
}

// Register shutdown handlers
if (typeof process !== 'undefined') {
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error);
        gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
}