"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, statusCode, data, message) => {
    const response = {
        status: 'success',
    };
    if (data)
        response.data = data;
    if (message)
        response.message = message;
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, statusCode, message, errors) => {
    const response = {
        status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
        message,
    };
    if (errors)
        response.errors = errors;
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
