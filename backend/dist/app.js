"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cors_2 = require("./config/cors");
const requestLogger_middleware_1 = require("./middleware/requestLogger.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const response_1 = require("./utils/response");
const errors_1 = require("./utils/errors");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const campaign_routes_1 = __importDefault(require("./modules/campaigns/campaign.routes"));
const cms_routes_1 = __importDefault(require("./modules/cms/cms.routes"));
const donation_routes_1 = __importDefault(require("./modules/donations/donation.routes"));
const document_routes_1 = __importDefault(require("./modules/documents/document.routes"));
const request_routes_1 = __importDefault(require("./modules/requests/request.routes"));
const enquiry_routes_1 = __importDefault(require("./modules/enquiries/enquiry.routes"));
const job_application_routes_1 = __importDefault(require("./modules/job-applications/job-application.routes"));
const intern_application_routes_1 = __importDefault(require("./modules/internships/intern-application.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const donor_routes_1 = __importDefault(require("./modules/donors/donor.routes"));
const finance_routes_1 = __importDefault(require("./modules/finance/finance.routes"));
const people_routes_1 = __importDefault(require("./modules/people/people.routes"));
const office_routes_1 = __importDefault(require("./modules/office/office.routes"));
const impact_routes_1 = __importDefault(require("./modules/impact/impact.routes"));
const payment_routes_1 = __importDefault(require("./modules/payments/payment.routes"));
const comms_routes_1 = __importDefault(require("./modules/comms/comms.routes"));
const app = (0, express_1.default)();
// 1. Security Middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "frame-src": ["'self'", "https://www.openstreetmap.org"],
            "img-src": ["'self'", "data:", "blob:", "https:"],
            "form-action": ["'self'", "https://www.sbiepay.sbi", "https://test.sbiepay.sbi"],
        },
    },
}));
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use((0, cookie_parser_1.default)());
// 2. Request parsing
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// 3. Performance & Logging
app.use((0, compression_1.default)());
app.use(requestLogger_middleware_1.requestLogger);
// 4. Rate Limiting (Basic global limit)
const limiter = (0, express_rate_limit_1.default)({
    max: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);
// 5. API Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/campaigns', campaign_routes_1.default);
app.use('/api/v1/cms', cms_routes_1.default);
app.use('/api/v1/donations', donation_routes_1.default);
app.use('/api/v1/documents', document_routes_1.default);
app.use('/api/v1/requests', request_routes_1.default);
app.use('/api/v1/enquiries', enquiry_routes_1.default);
app.use('/api/v1/job-applications', job_application_routes_1.default);
app.use('/api/v1/intern-applications', intern_application_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/donors', donor_routes_1.default);
app.use('/api/v1/finance', finance_routes_1.default);
app.use('/api/v1/people', people_routes_1.default);
app.use('/api/v1/office', office_routes_1.default);
app.use('/api/v1/impact', impact_routes_1.default);
app.use('/api/v1/payments', payment_routes_1.default);
app.use('/api/v1/comms', comms_routes_1.default);
// Static folder for uploaded files (receipts/certs/gallery/etc)
const possibleUploadPaths = [
    path_1.default.join(process.cwd(), 'uploads'),
    path_1.default.join(process.cwd(), 'public', 'uploads'),
    path_1.default.join(__dirname, 'uploads'),
    path_1.default.join(__dirname, '../uploads'),
    path_1.default.join(__dirname, '../../uploads'),
    path_1.default.join(__dirname, '../public/uploads'),
];
possibleUploadPaths.forEach(uploadDir => {
    if (fs_1.default.existsSync(uploadDir)) {
        console.log(`[Static Server] Serving /uploads from: ${uploadDir}`);
        app.use('/uploads', express_1.default.static(uploadDir));
    }
});
app.use('/uploads', express_1.default.static('uploads'));
app.get('/api/v1/health', (req, res) => {
    (0, response_1.sendSuccess)(res, 200, null, 'API is running and healthy');
});
// Serve frontend static build if available
const possibleFrontendPaths = [
    path_1.default.join(process.cwd(), 'public'),
    path_1.default.join(process.cwd(), 'dist', 'public'),
    path_1.default.join(process.cwd(), 'public_html'),
    path_1.default.join(process.cwd(), 'frontend_build'),
    path_1.default.join(__dirname, 'public'),
    path_1.default.join(__dirname, '../public'),
    path_1.default.join(__dirname, '../frontend_build'),
    path_1.default.join(__dirname, '../../public'),
    path_1.default.join(__dirname, '../../public_html'),
    path_1.default.join(__dirname, '../../frontend_build'),
    path_1.default.join(process.cwd(), '../public_html'),
];
const frontendPath = possibleFrontendPaths.find(dir => fs_1.default.existsSync(dir) && fs_1.default.existsSync(path_1.default.join(dir, 'index.html')));
if (frontendPath) {
    console.log(`[Static Server] Serving frontend from: ${frontendPath}`);
    app.use(express_1.default.static(frontendPath));
    // Express 5 compatible SPA catch-all (wildcard '*' is not supported in Express 5 path-to-regexp)
    app.use((req, res, next) => {
        if (req.method !== 'GET' || req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
            return next(new errors_1.NotFoundError(`Can't find ${req.originalUrl} on this server!`));
        }
        res.sendFile(path_1.default.join(frontendPath, 'index.html'));
    });
}
else {
    // Root welcome handler if no frontend build is attached to backend
    app.get('/', (req, res) => {
        (0, response_1.sendSuccess)(res, 200, {
            message: 'KNT World Welfare Foundation Backend API is running successfully',
            environment: process.env.NODE_ENV || 'production',
            health: '/api/v1/health'
        }, 'Backend API Server Active');
    });
    // Unhandled Routes
    app.use((req, res, next) => {
        next(new errors_1.NotFoundError(`Can't find ${req.originalUrl} on this server!`));
    });
}
// 6. Global Error Handling
app.use(error_middleware_1.errorHandler);
exports.default = app;
