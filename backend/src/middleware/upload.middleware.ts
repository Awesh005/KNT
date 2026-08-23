import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureDirExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Define directories relative to project root
const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');
const CERTIFICATES_DIR = path.join(UPLOADS_ROOT, 'certificates');
const TEAM_DIR = path.join(UPLOADS_ROOT, 'team');
const CAMPAIGNS_DIR = path.join(UPLOADS_ROOT, 'campaigns');
const VIDEOS_DIR = path.join(UPLOADS_ROOT, 'campaigns/videos');
const REQUESTS_DIR = path.join(UPLOADS_ROOT, 'requests');
const PROGRAMS_DIR = path.join(UPLOADS_ROOT, 'programs');
const FEATURED_DIR = path.join(UPLOADS_ROOT, 'featured_moments');
const GALLERY_IMAGES_DIR = path.join(UPLOADS_ROOT, 'gallery/images');
const GALLERY_VIDEOS_DIR = path.join(UPLOADS_ROOT, 'gallery/videos');
const POLICIES_DIR = path.join(UPLOADS_ROOT, 'policies');

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CERTIFICATES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `cert-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and SVG are allowed.'));
  }
};

export const uploadCertificate = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

const teamStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEAM_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `team-${uniqueSuffix}${ext}`);
  }
});

export const uploadTeamMember = multer({
  storage: teamStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

const campaignStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CAMPAIGNS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `campaign-${uniqueSuffix}${ext}`);
  }
});

export const uploadCampaignImage = multer({
  storage: campaignStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

const programStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROGRAMS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `program-${uniqueSuffix}${ext}`);
  }
});

export const uploadProgramImage = multer({
  storage: programStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

const featuredStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FEATURED_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `featured-${uniqueSuffix}${ext}`);
  }
});

export const uploadFeaturedImage = multer({
  storage: featuredStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VIDEOS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  }
});

const videoFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid video format. Only MP4, WEBM, and OGG are allowed.'));
  }
};

export const uploadCampaignVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for campaign videos
  fileFilter: videoFileFilter
});

const galleryImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, GALLERY_IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `gallery-${uniqueSuffix}${ext}`);
  }
});

export const uploadGalleryImage = multer({
  storage: galleryImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

const galleryVideoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, GALLERY_VIDEOS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `gallery-vid-${uniqueSuffix}${ext}`);
  }
});

export const uploadGalleryVideo = multer({
  storage: galleryVideoStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: videoFileFilter
});

const requestStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, REQUESTS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `req-doc-${uniqueSuffix}${ext}`);
  }
});

const docFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.'));
  }
};

export const uploadRequestDocument = multer({
  storage: requestStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: docFileFilter
});

const policyStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, POLICIES_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `policy-${uniqueSuffix}${ext}`);
  }
});

export const uploadPolicyDocument = multer({
  storage: policyStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: docFileFilter
});

const APPLICATIONS_DIR = path.join(UPLOADS_ROOT, 'applications');
ensureDirExists(APPLICATIONS_DIR);

const applicationStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, APPLICATIONS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const field = file.fieldname || 'doc';
    cb(null, `app-${field}-${uniqueSuffix}${ext}`);
  }
});

export const uploadJobApplicationFiles = multer({
  storage: applicationStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: docFileFilter
});

const OFFICE_DIR = path.join(UPLOADS_ROOT, 'office');
ensureDirExists(OFFICE_DIR);

const officeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, OFFICE_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

export const uploadOfficeFile = multer({
  storage: officeStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: docFileFilter,
});

const sealStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, OFFICE_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `seal${ext}`);
  },
});

export const uploadOfficeSeal = multer({
  storage: sealStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
