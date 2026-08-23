"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const errors_1 = require("../utils/errors");
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !roles.includes(userRole)) {
            return next(new errors_1.ForbiddenError(`Role (${userRole}) is not allowed to access this resource`));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
