"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, next) => {
    let error = err;
    // Log error
    if (error.isOperational && error.statusCode && error.statusCode < 500) {
        logger_1.logger.warn(`${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }
    else {
        logger_1.logger.error(`${error.status || '500'} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        if (env_1.env.NODE_ENV === 'development') {
            logger_1.logger.error(err.stack);
        }
    }
    // If it's a known operational error, send standard response
    if (error.isOperational) {
        return (0, response_1.sendError)(res, error.statusCode, error.message, error.errors);
    }
    // Programming or other unknown error: don't leak error details in production
    const statusCode = 500;
    const message = env_1.env.NODE_ENV === 'development' ? err.message : 'Something went very wrong!';
    return (0, response_1.sendError)(res, statusCode, message);
};
exports.errorHandler = errorHandler;
