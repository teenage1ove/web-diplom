import { createServer } from 'http';
import app from './app';
import { config } from './config/env';
import { prisma } from './config/database';
import { logger } from './utils/logger';
import { setupSocket } from './config/socket';

const PORT = config.PORT || 5000;

async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
}

async function startServer() {
  try {
    await testDatabaseConnection();

    // Create HTTP server and attach Socket.io
    const httpServer = createServer(app);
    setupSocket(httpServer);

    httpServer.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
      logger.info(`API: http://localhost:${PORT}/api/v1`);
      logger.info(`Health: http://localhost:${PORT}/health`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      httpServer.close(async () => {
        logger.info('HTTP server closed');
        try {
          await prisma.$disconnect();
          logger.info('Database disconnected');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
