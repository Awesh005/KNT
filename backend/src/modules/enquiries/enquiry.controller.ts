import { Request, Response, NextFunction } from 'express';
import { enquiryService } from './enquiry.service';
import { sendSuccess } from '../../utils/response';
import { mailService } from '../../services/mail.service';

export const enquiryController = {
  async createEnquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const enquiry = await enquiryService.createEnquiry(req.body);
      void mailService.sendEnquiryAlert(enquiry);
      sendSuccess(res, 201, { enquiry }, 'Enquiry submitted successfully');
    } catch (error) {
      next(error);
    }
  },

  async getEnquiries(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await enquiryService.getEnquiries(req.query);
      sendSuccess(res, 200, data, 'Enquiries fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getEnquiryById(req: Request, res: Response, next: NextFunction) {
    try {
      const enquiry = await enquiryService.getEnquiryById(parseInt(req.params.id as string));
      sendSuccess(res, 200, { enquiry }, 'Enquiry fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const enquiry = await enquiryService.updateEnquiryStatus(parseInt(req.params.id as string), req.body.status);
      sendSuccess(res, 200, { enquiry }, 'Enquiry status updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteEnquiry(req: Request, res: Response, next: NextFunction) {
    try {
      await enquiryService.deleteEnquiry(parseInt(req.params.id as string));
      sendSuccess(res, 200, null, 'Enquiry deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};
