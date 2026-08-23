import { Request, Response, NextFunction } from 'express';
import { jobApplicationService } from './job-application.service';
import { sendSuccess } from '../../utils/response';
import { ValidationError } from '../../utils/errors';
import { mailService } from '../../services/mail.service';

const REQUIRED_FILES = ['photo', 'aadhaar', 'education', 'resume', 'address'];

function collectUploadedFiles(req: Request): Record<string, Express.Multer.File> {
  const fileMap: Record<string, Express.Multer.File> = {};
  const files = req.files;
  if (!files) return fileMap;

  if (Array.isArray(files)) {
    files.forEach((file) => {
      fileMap[file.fieldname] = file;
    });
    return fileMap;
  }

  Object.entries(files).forEach(([field, list]) => {
    if (list?.[0]) fileMap[field] = list[0];
  });
  return fileMap;
}

function documentsFromUploads(fileMap: Record<string, Express.Multer.File>) {
  const documents: Record<string, string> = {};
  Object.entries(fileMap).forEach(([field, file]) => {
    documents[field] = `/uploads/applications/${file.filename}`;
  });
  return documents;
}

export const jobApplicationController = {
  async createApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { job_id, job_title, name, email, phone, qualification, experience } = req.body;

      if (!job_id || !job_title || !name || !email || !phone || !qualification) {
        throw new ValidationError('All required fields must be provided');
      }

      const fileMap = collectUploadedFiles(req);
      for (const field of REQUIRED_FILES) {
        if (!fileMap[field]) {
          throw new ValidationError(`Missing required document: ${field}`);
        }
      }

      const application = await jobApplicationService.createApplication({
        job_id,
        job_title,
        name,
        email,
        phone,
        qualification,
        experience,
        documents: documentsFromUploads(fileMap),
      });

      void mailService.sendJobApplicationAlert(application);
      sendSuccess(res, 201, { application }, 'Application submitted successfully');
    } catch (error) {
      next(error);
    }
  },

  async createAdminApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { job_id, job_title, name, email, phone, qualification, experience } = req.body;

      if (!name || !email || !phone || !job_title) {
        throw new ValidationError('Name, email, phone, and job title are required');
      }

      const application = await jobApplicationService.createApplication({
        job_id: job_id || `walk-in-${Date.now()}`,
        job_title,
        name,
        email,
        phone,
        qualification: qualification || 'Not specified',
        experience,
        documents: documentsFromUploads(collectUploadedFiles(req)),
      });

      sendSuccess(res, 201, { application }, 'Application added');
    } catch (error) {
      next(error);
    }
  },

  async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await jobApplicationService.getApplications(req.query);
      sendSuccess(res, 200, data, 'Applications fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getApplicationById(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await jobApplicationService.getApplicationById(parseInt(req.params.id as string, 10));
      sendSuccess(res, 200, { application }, 'Application fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await jobApplicationService.updateApplicationStatus(
        parseInt(req.params.id as string, 10),
        req.body.status
      );
      sendSuccess(res, 200, { application }, 'Application status updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteApplication(req: Request, res: Response, next: NextFunction) {
    try {
      await jobApplicationService.deleteApplication(parseInt(req.params.id as string, 10));
      sendSuccess(res, 200, null, 'Application deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
