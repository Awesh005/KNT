import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import { corsOptions } from './config/cors';
import { requestLogger } from './middleware/requestLogger.middleware';
import { errorHandler } from './middleware/error.middleware';
import { sendSuccess } from './utils/response';
import { NotFoundError } from './utils/errors';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import campaignRoutes from './modules/campaigns/campaign.routes';
import cmsRoutes from './modules/cms/cms.routes';
import donationRoutes from './modules/donations/donation.routes';
import documentRoutes from './modules/documents/document.routes';
import requestRoutes from './modules/requests/request.routes';
import enquiryRoutes from './modules/enquiries/enquiry.routes';
import jobApplicationRoutes from './modules/job-applications/job-application.routes';
import internApplicationRoutes from './modules/internships/intern-application.routes';
import adminRoutes from './modules/admin/admin.routes';
import donorRoutes from './modules/donors/donor.routes';
import financeRoutes from './modules/finance/finance.routes';
import peopleRoutes from './modules/people/people.routes';
import officeRoutes from './modules/office/office.routes';
import impactRoutes from './modules/impact/impact.routes';
import paymentRoutes from './modules/payments/payment.routes';
import commsRoutes from './modules/comms/comms.routes';

const app = express();

// 1. Security Middleware
app.use(helmet({
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
app.use(cors(corsOptions));
app.use(cookieParser());

// 2. Request parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 3. Performance & Logging
app.use(compression());
app.use(requestLogger);

// 4. Rate Limiting (Basic global limit)
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// 5. API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/enquiries', enquiryRoutes);
app.use('/api/v1/job-applications', jobApplicationRoutes);
app.use('/api/v1/intern-applications', internApplicationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/donors', donorRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/people', peopleRoutes);
app.use('/api/v1/office', officeRoutes);
app.use('/api/v1/impact', impactRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/comms', commsRoutes);

// Static folder for uploaded files (receipts/certs/gallery/etc)
const possibleUploadPaths = [
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), 'public', 'uploads'),
  path.join(__dirname, 'uploads'),
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../../uploads'),
  path.join(__dirname, '../public/uploads'),
];

possibleUploadPaths.forEach(uploadDir => {
  if (fs.existsSync(uploadDir)) {
    console.log(`[Static Server] Serving /uploads from: ${uploadDir}`);
    app.use('/uploads', express.static(uploadDir));
  }
});
app.use('/uploads', express.static('uploads'));

app.get('/api/v1/health', (req: Request, res: Response) => {
  sendSuccess(res, 200, null, 'API is running and healthy');
});

// Serve frontend static build if available
const possibleFrontendPaths = [
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), 'dist', 'public'),
  path.join(process.cwd(), 'public_html'),
  path.join(process.cwd(), 'frontend_build'),
  path.join(__dirname, 'public'),
  path.join(__dirname, '../public'),
  path.join(__dirname, '../frontend_build'),
  path.join(__dirname, '../../public'),
  path.join(__dirname, '../../public_html'),
  path.join(__dirname, '../../frontend_build'),
  path.join(process.cwd(), '../public_html'),
];

const frontendPath = possibleFrontendPaths.find(dir => fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html')));

if (frontendPath) {
  console.log(`[Static Server] Serving frontend from: ${frontendPath}`);
  app.use(express.static(frontendPath));
  
  // Express 5 compatible SPA catch-all (wildcard '*' is not supported in Express 5 path-to-regexp)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' || req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // Root welcome handler if no frontend build is attached to backend
  app.get('/', (req: Request, res: Response) => {
    sendSuccess(res, 200, {
      message: 'KNT World Welfare Foundation Backend API is running successfully',
      environment: process.env.NODE_ENV || 'production',
      health: '/api/v1/health'
    }, 'Backend API Server Active');
  });

  // Unhandled Routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
  });
}

// 6. Global Error Handling
app.use(errorHandler);

export default app;
