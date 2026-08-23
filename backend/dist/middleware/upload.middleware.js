"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadOfficeSeal = exports.uploadOfficeFile = exports.uploadJobApplicationFiles = exports.uploadPolicyDocument = exports.uploadRequestDocument = exports.uploadGalleryVideo = exports.uploadGalleryImage = exports.uploadCampaignVideo = exports.uploadFeaturedImage = exports.uploadProgramImage = exports.uploadCampaignImage = exports.uploadTeamMember = exports.uploadCertificate = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure upload directories exist
const ensureDirExists = (dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
// Define directories relative to project root
const UPLOADS_ROOT = path_1.default.join(process.cwd(), 'uploads');
const CERTIFICATES_DIR = path_1.default.join(UPLOADS_ROOT, 'certificates');
const TEAM_DIR = path_1.default.join(UPLOADS_ROOT, 'team');
const CAMPAIGNS_DIR = path_1.default.join(UPLOADS_ROOT, 'campaigns');
const VIDEOS_DIR = path_1.default.join(UPLOADS_ROOT, 'campaigns/videos');
const REQUESTS_DIR = path_1.default.join(UPLOADS_ROOT, 'requests');
const PROGRAMS_DIR = path_1.default.join(UPLOADS_ROOT, 'programs');
const FEATURED_DIR = path_1.default.join(UPLOADS_ROOT, 'featured_moments');
const GALLERY_IMAGES_DIR = path_1.default.join(UPLOADS_ROOT, 'gallery/images');
const GALLERY_VIDEOS_DIR = path_1.default.join(UPLOADS_ROOT, 'gallery/videos');
const POLICIES_DIR = path_1.default.join(UPLOADS_ROOT, 'policies');
// Create them if they don't exist
ensureDirExists(UPLOADS_ROOT);
ensureDirExists(CERTIFICATES_DIR);
ensureDirExists(TEAM_DIR);
ensureDirExists(CAMPAIGNS_DIR);
ensureDirExists(VIDEOS_DIR);
ensureDirExists(REQUESTS_DIR);
ensureDirExists(PROGRAMS_DIR);
ensureDirExists(FEATURED_DIR);
ensureDirExists(GALLERY_IMAGES_DIR);
ensureDirExists(GALLERY_VIDEOS_DIR);
ensureDirExists(POLICIES_DIR);
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, CERTIFICATES_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `cert-${uniqueSuffix}${ext}`);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and SVG are allowed.'));
    }
};
exports.uploadCertificate = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});
const teamStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, TEAM_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `team-${uniqueSuffix}${ext}`);
    }
});
exports.uploadTeamMember = (0, multer_1.default)({
    storage: teamStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});
const campaignStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, CAMPAIGNS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `campaign-${uniqueSuffix}${ext}`);
    }
});
exports.uploadCampaignImage = (0, multer_1.default)({
    storage: campaignStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});
const programStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PROGRAMS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `program-${uniqueSuffix}${ext}`);
    }
});
exports.uploadProgramImage = (0, multer_1.default)({
    storage: programStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});
const featuredStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, FEATURED_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `featured-${uniqueSuffix}${ext}`);
    }
});
exports.uploadFeaturedImage = (0, multer_1.default)({
    storage: featuredStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});
const videoStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, VIDEOS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `video-${uniqueSuffix}${ext}`);
    }
});
const videoFileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid video format. Only MP4, WEBM, and OGG are allowed.'));
    }
};
exports.uploadCampaignVideo = (0, multer_1.default)({
    storage: videoStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for campaign videos
    fileFilter: videoFileFilter
});
const galleryImageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, GALLERY_IMAGES_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `gallery-${uniqueSuffix}${ext}`);
    }
});
exports.uploadGalleryImage = (0, multer_1.default)({
    storage: galleryImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});
const galleryVideoStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, GALLERY_VIDEOS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `gallery-vid-${uniqueSuffix}${ext}`);
    }
});
exports.uploadGalleryVideo = (0, multer_1.default)({
    storage: galleryVideoStorage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: videoFileFilter
});
const requestStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, REQUESTS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `req-doc-${uniqueSuffix}${ext}`);
    }
});
const docFileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.'));
    }
};
exports.uploadRequestDocument = (0, multer_1.default)({
    storage: requestStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: docFileFilter
});
const policyStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, POLICIES_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `policy-${uniqueSuffix}${ext}`);
    }
});
exports.uploadPolicyDocument = (0, multer_1.default)({
    storage: policyStorage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: docFileFilter
});
const APPLICATIONS_DIR = path_1.default.join(UPLOADS_ROOT, 'applications');
ensureDirExists(APPLICATIONS_DIR);
const applicationStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, APPLICATIONS_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        const field = file.fieldname || 'doc';
        cb(null, `app-${field}-${uniqueSuffix}${ext}`);
    }
});
exports.uploadJobApplicationFiles = (0, multer_1.default)({
    storage: applicationStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: docFileFilter
});
const OFFICE_DIR = path_1.default.join(UPLOADS_ROOT, 'office');
ensureDirExists(OFFICE_DIR);
const officeStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, OFFICE_DIR),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `file-${uniqueSuffix}${ext}`);
    },
});
exports.uploadOfficeFile = (0, multer_1.default)({
    storage: officeStorage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: docFileFilter,
});
const sealStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, OFFICE_DIR),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname) || '.png';
        cb(null, `seal${ext}`);
    },
});
exports.uploadOfficeSeal = (0, multer_1.default)({
    storage: sealStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
});
