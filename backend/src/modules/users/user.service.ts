import { userModel } from './user.model';
import { AppError, NotFoundError, ValidationError } from '../../utils/errors';
import { randomUUID as uuidv4 } from 'crypto';
import bcrypt from 'bcrypt';

export const userService = {
  async getAllUsers(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const { users, total } = await userModel.getAllUsers(limit, offset);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async createAdmin(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const userId = 'USR-' + uuidv4().split('-')[0].toUpperCase();

    try {
      await userModel.createAdmin(userId, data.name, data.email, hashedPassword);
    } catch (e: any) {
      if (e.code === 'ER_DUP_ENTRY') {
        throw new ValidationError('Email already exists');
      }
      throw e;
    }

    return {
      id: userId,
      name: data.name,
      email: data.email,
      role: 'Admin'
    };
  },

  async updateAdmin(id: string, data: any) {
    let hashedPassword;
    if (data.password && data.password.trim() !== '') {
      hashedPassword = await bcrypt.hash(data.password, 12);
    }
    
    try {
      const success = await userModel.updateAdmin(id, data.email, hashedPassword);
      if (!success) {
        throw new NotFoundError('Admin not found');
      }
    } catch (e: any) {
      if (e.code === 'ER_DUP_ENTRY') {
        throw new ValidationError('Email already exists');
      }
      throw e;
    }
    
    return { message: 'Admin updated successfully' };
  },

  async getUserById(id: string) {
    const user = await userModel.getUserById(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  async updateUserRole(id: string, role: string) {
    const success = await userModel.updateUserRole(id, role);
    if (!success) throw new NotFoundError('User not found');
    return { message: 'Role updated successfully' };
  },

  async updateUserStatus(id: string, status: string) {
    const success = await userModel.updateUserStatus(id, status);
    if (!success) throw new NotFoundError('User not found');
    return { message: 'Status updated successfully' };
  },

  async deleteUser(id: string) {
    if (id === 'USR-001') {
      throw new AppError('Cannot delete the primary Super Admin', 403);
    }
    const success = await userModel.deleteUser(id);
    if (!success) throw new NotFoundError('User not found');
    return { message: 'User deleted successfully' };
  }
};
