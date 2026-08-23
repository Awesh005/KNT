import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { exec } from 'child_process';

const startServer = () => {
  try {
    const port = env.PORT;
    
    app.listen(port, () => {
      logger.info(`Server is running in ${env.NODE_ENV} mode on port ${port}`);
      
      // Run Orphan File Cleanup automatically every 24 hours (86400000 ms)
      setInterval(() => {
        logger.info('Starting daily automated orphan file cleanup...');
        exec('npm run cleanup', (error, stdout, stderr) => {
          if (error) {
            logger.error(`Automated cleanup failed: ${error.message}`);
            return;
          }
          if (stderr) logger.warn(`Automated cleanup stderr: ${stderr}`);
          logger.info(`Automated cleanup output: \n${stdout}`);
        });
      }, 24 * 60 * 60 * 1000);
      
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle Uncaught Exceptions cleanly without crashing Hostinger Passenger runner
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥');
  logger.error(err.name, err.message, err.stack);
});

// Handle Unhandled Rejections cleanly without crashing Hostinger Passenger runner
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥');
  if (err) {
    logger.error(err.name, err.message, err.stack);
  }
});
