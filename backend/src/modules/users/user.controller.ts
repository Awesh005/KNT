import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { userService } from './user.service';
import { userModel } from './user.model';
import { sendSuccess } from '../../utils/response';
import { AppError, ValidationError } from '../../utils/errors';

export const userController = {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const data = await userService.getAllUsers(page, limit);
      sendSuccess(res, 200, data, 'Users fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.createAdmin(req.body);
      sendSuccess(res, 201, result, 'Admin created successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.updateAdmin(req.params.id as string, req.body);
      sendSuccess(res, 200, result, 'Admin updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id as string);
      sendSuccess(res, 200, { user }, 'User fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.updateUserRole(req.params.id as string, req.body.role);
      sendSuccess(res, 200, result, 'Role updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.updateUserStatus(req.params.id as string, req.body.status);
      sendSuccess(res, 200, result, 'Status updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { name, currentPassword, newPassword } = req.body;

      if (!name) {
        throw new ValidationError('Name is required');
      }

      let hashedPassword;
      if (newPassword) {
        if (!currentPassword) {
          throw new ValidationError('Current password is required to set a new password');
        }
        
        const currentHash = await userModel.getUserPasswordHash(userId);
        if (!currentHash) {
          throw new AppError('User not found', 404);
        }

        const isMatch = await bcrypt.compare(currentPassword, currentHash);
        if (!isMatch) {
          throw new ValidationError('Incorrect current password');
        }

        hashedPassword = await bcrypt.hash(newPassword, 10);
      }

      const success = await userModel.updateProfile(userId, name, hashedPassword);
      if (!success) {
        throw new AppError('Failed to update profile', 500);
      }

      sendSuccess(res, 200, null, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.deleteUser(req.params.id as string);
      sendSuccess(res, 200, result, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};
