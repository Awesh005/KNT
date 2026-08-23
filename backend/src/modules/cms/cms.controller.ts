import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { cmsService } from './cms.service';
import { sendSuccess } from '../../utils/response';
import { ValidationError } from '../../utils/errors';

export const cmsController = {
  async getContent(req: Request, res: Response, next: NextFunction) {
    try {
      const pageKey = req.params.pageKey as string;
      const sectionKey = req.params.sectionKey as string;
      const data = await cmsService.getContent(pageKey, sectionKey);
      sendSuccess(res, 200, data, 'CMS content fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateContent(req: Request, res: Response, next: NextFunction) {
    try {
      const pageKey = req.params.pageKey as string;
      const sectionKey = req.params.sectionKey as string;
      const userId = (req as any).user.id;
      
      const result = await cmsService.updateContent(pageKey, sectionKey, req.body.content, userId);
      sendSuccess(res, 200, result, 'CMS content updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async uploadCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new Error('No file uploaded');
      }
      
      const fileUrl = `/uploads/certificates/${req.file.filename}`;
      sendSuccess(res, 200, { url: fileUrl }, 'Certificate uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteCertificateFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileUrl } = req.body;
      if (!fileUrl || typeof fileUrl !== 'string') {
        throw new Error('File URL is required');
      }

      // Security check: only allow deleting files in /uploads/certificates/ and prevent traversal
      if (!fileUrl.startsWith('/uploads/certificates/') || fileUrl.includes('..')) {
        throw new Error('Invalid file path');
      }

      // Construct absolute file path
      const filePath = path.join(process.cwd(), fileUrl);
      
      // Check if file exists and delete it
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      sendSuccess(res, 200, null, 'File deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async uploadTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new Error('No file uploaded');
      }
      
      const fileUrl = `/uploads/team/${req.file.filename}`;
      sendSuccess(res, 200, { url: fileUrl }, 'Team member photo uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteTeamMemberFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileUrl } = req.body;
      if (!fileUrl || typeof fileUrl !== 'string') {
        throw new Error('File URL is required');
      }

      if (!fileUrl.startsWith('/uploads/team/') || fileUrl.includes('..')) {
        throw new Error('Invalid file path');
      }

      const filePath = path.join(process.cwd(), fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      sendSuccess(res, 200, null, 'Team member photo deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async uploadCampaignImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new Error('No file uploaded');
      }
      
      const fileUrl = `/uploads/campaigns/${req.file.filename}`;
      sendSuccess(res, 200, { url: fileUrl }, 'Campaign image uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteCampaignImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileUrl } = req.body;
      if (!fileUrl || typeof fileUrl !== 'string') {
        throw new Error('File URL is required');
      }

      if (!fileUrl.startsWith('/uploads/campaigns/') || fileUrl.includes('..')) {
        throw new Error('Invalid file path');
      }

      const filePath = path.join(process.cwd(), fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      sendSuccess(res, 200, null, 'Campaign image deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async uploadCampaignVideo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new Error('No video file uploaded');
      }
      
      const fileUrl = `/uploads/campaigns/videos/${req.file.filename}`;
      sendSuccess(res, 200, { url: fileUrl }, 'Campaign video uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteCampaignVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileUrl } = req.body;
      if (!fileUrl || typeof fileUrl !== 'string') {
        throw new Error('File URL is required');
      }

      if (!fileUrl.startsWith('/uploads/campaigns/videos/') || fileUrl.includes('..')) {
        throw new Error('Invalid file path');
      }

      const filePath = path.join(process.cwd(), fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      sendSuccess(res, 200, null, 'Campaign video deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async uploadProgramImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new ValidationError('No image file provided');
      }
      
      const fileUrl = `/uploads/programs/${req.file.filename}`;
      sendSuccess(res, 201, { fileUrl }, 'Program image uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteProgramImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileUrl } = req.body;
      if (!fileUrl) {
        throw new ValidationError('File URL is required');
      }
      
      const filename = fileUrl.split('/').pop();
      if (!filename) {
        throw new ValidationError('Invalid file URL');
      }
      
      const filePath = path.join(process.cwd(), 'uploads', 'programs', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      sendSuccess(res, 200, null, 'Program image deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async uploadFeaturedImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new ValidationError('No image file provided');
      }
      
      const fileUrl = `/uploads/featured_moments/${req.file.filename}`;
      sendSuccess(res, 201, { fileUrl }, 'Featured moment image uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteFeaturedImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileUrl } = req.body;
      if (!fileUrl) {
        throw new ValidationError('File URL is required');
      }
      
      const filename = fileUrl.split('/').pop();
      if (!filename) {
        throw new ValidationError('Invalid file URL');
      }
      
      const filePath = path.join(process.cwd(), 'uploads', 'featured_moments', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      sendSuccess(res, 200, null, 'Featured moment image deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async uploadGalleryImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new ValidationError('No image file provided');
      }
      
      const fileUrl = `/uploads/gallery/images/${req.file.filename}`;
      sendSuccess(res, 201, { fileUrl }, 'Gallery image uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteGalleryImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileUrl } = req.body;
      if (!fileUrl) {
        throw new ValidationError('File URL is required');
      }
      
      const filename = fileUrl.split('/').pop();
      if (!filename) {
        throw new ValidationError('Invalid file URL');
      }
      
      const filePath = path.join(process.cwd(), 'uploads', 'gallery', 'images', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      sendSuccess(res, 200, null, 'Gallery image deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async uploadGalleryVideo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new ValidationError('No video file provided');
      }
      
      const fileUrl = `/uploads/gallery/videos/${req.file.filename}`;
      sendSuccess(res, 201, { fileUrl }, 'Gallery video uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteGalleryVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileUrl } = req.body;
      if (!fileUrl) {
        throw new ValidationError('File URL is required');
      }
      
      const filename = fileUrl.split('/').pop();
      if (!filename) {
        throw new ValidationError('Invalid file URL');
      }
      
      const filePath = path.join(process.cwd(), 'uploads', 'gallery', 'videos', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      sendSuccess(res, 200, null, 'Gallery video deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async uploadPolicyDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new ValidationError('No document file provided');
      }

      const fileUrl = `/uploads/policies/${req.file.filename}`;
      sendSuccess(res, 201, { fileUrl }, 'Policy document uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  async deletePolicyDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileUrl } = req.body;
      if (!fileUrl || typeof fileUrl !== 'string') {
        throw new ValidationError('File URL is required');
      }

      if (!fileUrl.startsWith('/uploads/policies/') || fileUrl.includes('..')) {
        throw new ValidationError('Invalid file path');
      }

      const filePath = path.join(process.cwd(), fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      sendSuccess(res, 200, null, 'Policy document deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};
