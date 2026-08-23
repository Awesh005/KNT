import fs from 'fs';
import path from 'path';
import { pool } from '../src/config/database';
import { env } from '../src/config/env';

// Determine the uploads directory relative to process.cwd()
const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');
const UPLOAD_SUBDIRS = [
  { dir: path.join(UPLOADS_ROOT, 'requests'), prefix: '/uploads/requests' },
  { dir: path.join(UPLOADS_ROOT, 'campaigns'), prefix: '/uploads/campaigns' },
  { dir: path.join(UPLOADS_ROOT, 'campaigns/videos'), prefix: '/uploads/campaigns/videos' },
  { dir: path.join(UPLOADS_ROOT, 'certificates'), prefix: '/uploads/certificates' },
  { dir: path.join(UPLOADS_ROOT, 'team'), prefix: '/uploads/team' },
  { dir: path.join(UPLOADS_ROOT, 'programs'), prefix: '/uploads/programs' },
  { dir: path.join(UPLOADS_ROOT, 'featured_moments'), prefix: '/uploads/featured_moments' },
  { dir: path.join(UPLOADS_ROOT, 'gallery/images'), prefix: '/uploads/gallery/images' },
  { dir: path.join(UPLOADS_ROOT, 'gallery/videos'), prefix: '/uploads/gallery/videos' },
  { dir: path.join(UPLOADS_ROOT, 'screenshots'), prefix: '/uploads/screenshots' },
  { dir: path.join(UPLOADS_ROOT, 'receipts'), prefix: '/uploads/receipts' },
  { dir: path.join(UPLOADS_ROOT, '80g_certificates'), prefix: '/uploads/80g_certificates' },
];

// Delete files older than 24 hours
const MAX_AGE_MS = 24 * 60 * 60 * 1000; 

function extractUploadUrls(text: string, urlsSet: Set<string>) {
  if (!text) return;
  const matches = text.match(/\/uploads\/[^\s"',\]\}]+/g);
  if (matches) {
    matches.forEach(url => urlsSet.add(url));
  }
}

async function getReferencedUrls(): Promise<Set<string>> {
  const urls = new Set<string>();

  try {
    // 1. Get from fundraiser_requests
    const [requests] = await pool.query('SELECT documents FROM fundraiser_requests');
    (requests as any[]).forEach(row => {
      if (row.documents) {
        extractUploadUrls(typeof row.documents === 'string' ? row.documents : JSON.stringify(row.documents), urls);
      }
    });

    // 2. Get from campaigns
    const [campaigns] = await pool.query('SELECT cover_image, documents, video_url FROM campaigns');
    (campaigns as any[]).forEach(row => {
      if (row.cover_image) extractUploadUrls(typeof row.cover_image === 'string' ? row.cover_image : JSON.stringify(row.cover_image), urls);
      if (row.documents) extractUploadUrls(typeof row.documents === 'string' ? row.documents : JSON.stringify(row.documents), urls);
      if (row.video_url) extractUploadUrls(row.video_url, urls);
    });

    // 3. Get from donations
    const [donations] = await pool.query('SELECT screenshot_url FROM donations WHERE screenshot_url IS NOT NULL');
    (donations as any[]).forEach(row => {
      if (row.screenshot_url) extractUploadUrls(row.screenshot_url, urls);
    });

    // 4. Get from receipts
    const [receipts] = await pool.query('SELECT pdf_url FROM receipts WHERE pdf_url IS NOT NULL');
    (receipts as any[]).forEach(row => {
      if (row.pdf_url) extractUploadUrls(row.pdf_url, urls);
    });

    // 5. Get from 80g_certificates
    const [certs] = await pool.query('SELECT pdf_url FROM eighty_g_certificates WHERE pdf_url IS NOT NULL');
    (certs as any[]).forEach(row => {
      if (row.pdf_url) extractUploadUrls(row.pdf_url, urls);
    });

    // 6. Get from cms_content
    const [cmsRows] = await pool.query('SELECT content FROM cms_content');
    (cmsRows as any[]).forEach(row => {
      if (row.content) extractUploadUrls(typeof row.content === 'string' ? row.content : JSON.stringify(row.content), urls);
    });

    // 7. Get from content_modules
    const [moduleRows] = await pool.query('SELECT media FROM content_modules');
    (moduleRows as any[]).forEach(row => {
      if (row.media) extractUploadUrls(row.media, urls);
    });

  } catch (error) {
    console.error("Error fetching referenced URLs from DB:", error);
  }

  return urls;
}

async function cleanDirectory(dirPath: string, prefixUrl: string, referencedUrls: Set<string>) {
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);
  let deletedCount = 0;

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) continue;

    const fileUrl = `${prefixUrl}/${file}`;
    const stats = fs.statSync(fullPath);
    const age = Date.now() - stats.mtimeMs;

    // If file is older than 24h and NOT referenced in the database, delete it
    if (age > MAX_AGE_MS && !referencedUrls.has(fileUrl)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`Deleted orphan file: ${fileUrl}`);
        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete file ${fullPath}:`, err);
      }
    }
  }

  if (deletedCount > 0) {
    console.log(`Cleanup finished for ${dirPath}. Deleted ${deletedCount} files.`);
  }
}

async function runCleanup() {
  console.log("Starting Orphan File Cleanup Script...");
  const referencedUrls = await getReferencedUrls();
  
  for (const item of UPLOAD_SUBDIRS) {
    await cleanDirectory(item.dir, item.prefix, referencedUrls);
  }

  console.log("Cleanup complete!");
  process.exit(0);
}

runCleanup();
