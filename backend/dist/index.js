"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const child_process_1 = require("child_process");
const startServer = () => {
    try {
        const port = env_1.env.PORT;
        app_1.default.listen(port, () => {
            logger_1.logger.info(`Server is running in ${env_1.env.NODE_ENV} mode on port ${port}`);
            // Run Orphan File Cleanup automatically every 24 hours (86400000 ms)
            setInterval(() => {
                logger_1.logger.info('Starting daily automated orphan file cleanup...');
                (0, child_process_1.exec)('npm run cleanup', (error, stdout, stderr) => {
                    if (error) {
                        logger_1.logger.error(`Automated cleanup failed: ${error.message}`);
                        return;
                    }
                    if (stderr)
                        logger_1.logger.warn(`Automated cleanup stderr: ${stderr}`);
                    logger_1.logger.info(`Automated cleanup output: \n${stdout}`);
                });
            }, 24 * 60 * 60 * 1000);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
// Handle Uncaught Exceptions cleanly without crashing Hostinger Passenger runner
process.on('uncaughtException', (err) => {
    logger_1.logger.error('UNCAUGHT EXCEPTION! 💥');
    logger_1.logger.error(err.name, err.message, err.stack);
});
// Handle Unhandled Rejections cleanly without crashing Hostinger Passenger runner
process.on('unhandledRejection', (err) => {
    logger_1.logger.error('UNHANDLED REJECTION! 💥');
    if (err) {
        logger_1.logger.error(err.name, err.message, err.stack);
    }
});
