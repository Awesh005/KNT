import { Request, Response, NextFunction } from 'express';
import { peopleService } from './people.service';
import { authModel } from '../auth/auth.model';
import { sendSuccess } from '../../utils/response';

async function currentUser(req: Request) {
  const tokenUser = (req as any).user;
  if (!tokenUser?.id) return null;
  const row = await authModel.findUserById(tokenUser.id);
  return row ? { id: row.id, email: row.email, name: row.name, role: row.role } : null;
}

export const peopleController = {
  async applyMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const membership = await peopleService.applyMembership(req.body, (req as any).user);
      sendSuccess(res, 201, { membership }, 'Membership application received');
    } catch (error) {
      next(error);
    }
  },

  async listMemberships(req: Request, res: Response, next: NextFunction) {
    try {
      const memberships = await peopleService.listMemberships(req.query.status as string);
      sendSuccess(res, 200, { memberships }, 'Memberships fetched');
    } catch (error) {
      next(error);
    }
  },

  async decideMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const membership = await peopleService.decideMembership(req.params.id as string, req.body.status);
      sendSuccess(res, 200, { membership }, 'Membership updated');
    } catch (error) {
      next(error);
    }
  },

  async createMembershipAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await peopleService.createMembershipByAdmin(req.body);
      sendSuccess(res, 201, result, 'Member created with portal login');
    } catch (error) {
      next(error);
    }
  },

  async setMembershipCredentials(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await peopleService.setMembershipCredentials(req.params.id as string, req.body.password);
      sendSuccess(res, 200, result, 'Login password updated');
    } catch (error) {
      next(error);
    }
  },

  async reissueMembershipId(req: Request, res: Response, next: NextFunction) {
    try {
      const membership = await peopleService.reissueMembershipId(req.params.id as string);
      sendSuccess(res, 200, { membership }, 'ID card reissued');
    } catch (error) {
      next(error);
    }
  },

  async myMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await currentUser(req);
      const membership = await peopleService.myMembership(user!);
      sendSuccess(res, 200, { membership }, 'Membership fetched');
    } catch (error) {
      next(error);
    }
  },

  async renewMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await currentUser(req);
      const membership = await peopleService.renewMembership(user!, req.body);
      sendSuccess(res, 200, { membership }, 'Renewal submitted');
    } catch (error) {
      next(error);
    }
  },

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await peopleService.verifyPerson(req.params.code as string);
      sendSuccess(res, 200, { record }, record ? 'Valid' : 'Not found');
    } catch (error) {
      next(error);
    }
  },

  async sendReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await peopleService.sendExpiryReminders();
      sendSuccess(res, 200, result, 'Reminders sent');
    } catch (error) {
      next(error);
    }
  },

  async applyVolunteer(req: Request, res: Response, next: NextFunction) {
    try {
      const volunteer = await peopleService.applyVolunteer(req.body, (req as any).user);
      sendSuccess(res, 201, { volunteer }, 'Volunteer application received');
    } catch (error) {
      next(error);
    }
  },

  async listVolunteers(req: Request, res: Response, next: NextFunction) {
    try {
      const volunteers = await peopleService.listVolunteers(req.query.status as string);
      sendSuccess(res, 200, { volunteers }, 'Volunteers fetched');
    } catch (error) {
      next(error);
    }
  },

  async decideVolunteer(req: Request, res: Response, next: NextFunction) {
    try {
      const volunteer = await peopleService.decideVolunteer(req.params.id as string, req.body.status);
      sendSuccess(res, 200, { volunteer }, 'Volunteer updated');
    } catch (error) {
      next(error);
    }
  },

  async createVolunteerAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await peopleService.createVolunteerByAdmin(req.body);
      sendSuccess(res, 201, result, 'Volunteer created with portal login');
    } catch (error) {
      next(error);
    }
  },

  async setVolunteerCredentials(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await peopleService.setVolunteerCredentials(req.params.id as string, req.body.password);
      sendSuccess(res, 200, result, 'Login password updated');
    } catch (error) {
      next(error);
    }
  },

  async myVolunteer(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await currentUser(req);
      const volunteer = await peopleService.myVolunteer(user!);
      sendSuccess(res, 200, { volunteer }, 'Volunteer profile fetched');
    } catch (error) {
      next(error);
    }
  },

  async logHours(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await currentUser(req);
      const volunteer = await peopleService.logHours(user!, req.body);
      sendSuccess(res, 201, { volunteer }, 'Hours logged');
    } catch (error) {
      next(error);
    }
  },

  async addAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const volunteer = await peopleService.addAssignment(req.params.id as string, req.body);
      sendSuccess(res, 201, { volunteer }, 'Assignment added');
    } catch (error) {
      next(error);
    }
  },

  async listEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const employees = await peopleService.listEmployees();
      sendSuccess(res, 200, { employees }, 'Employees fetched');
    } catch (error) {
      next(error);
    }
  },

  async hire(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await peopleService.hireFromApplication(req.body);
      sendSuccess(res, 201, { employee }, 'Applicant hired');
    } catch (error) {
      next(error);
    }
  },

  async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await peopleService.createEmployee(req.body);
      sendSuccess(res, 201, result, 'Employee created with portal login');
    } catch (error) {
      next(error);
    }
  },

  async setEmployeeCredentials(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await peopleService.setEmployeeCredentials(req.params.id as string, req.body.password);
      sendSuccess(res, 200, result, 'Login password updated');
    } catch (error) {
      next(error);
    }
  },

  async myEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await peopleService.myEmployee((req as any).user.id);
      sendSuccess(res, 200, { employee: profile }, 'Staff profile fetched');
    } catch (error) {
      next(error);
    }
  },

  async addDoc(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await peopleService.addEmployeeDoc(req.params.id as string, req.body.title, req.body.file_base64);
      sendSuccess(res, 201, { employee }, 'Document added');
    } catch (error) {
      next(error);
    }
  },

  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const method = req.body.method === 'qr' ? 'qr' : 'manual';
      const result = await peopleService.checkIn((req as any).user.id, method);
      sendSuccess(res, 200, result, result.already ? 'Already marked today' : 'Attendance marked');
    } catch (error) {
      next(error);
    }
  },

  async listAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const attendance = await peopleService.listAttendance(req.query);
      sendSuccess(res, 200, { attendance }, 'Attendance fetched');
    } catch (error) {
      next(error);
    }
  },

  async adminMarkAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await peopleService.adminMarkAttendance(req.body);
      sendSuccess(res, 200, result, result.already ? 'Already marked for this date' : 'Attendance marked');
    } catch (error) {
      next(error);
    }
  },

  async applyLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const leave = await peopleService.applyLeave((req as any).user.id, req.body);
      sendSuccess(res, 201, { leave }, 'Leave applied');
    } catch (error) {
      next(error);
    }
  },

  async listLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const leave = await peopleService.listLeave(req.query.employee_id as string);
      sendSuccess(res, 200, { leave }, 'Leave fetched');
    } catch (error) {
      next(error);
    }
  },

  async adminApplyLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const leave = await peopleService.adminApplyLeave(req.body);
      sendSuccess(res, 201, { leave }, 'Leave request added');
    } catch (error) {
      next(error);
    }
  },

  async decideLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const leave = await peopleService.decideLeave(parseInt(req.params.id as string, 10), req.body.status);
      sendSuccess(res, 200, { leave }, 'Leave updated');
    } catch (error) {
      next(error);
    }
  },

  async listAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const announcements = await peopleService.listAnnouncements();
      sendSuccess(res, 200, { announcements }, 'Announcements fetched');
    } catch (error) {
      next(error);
    }
  },

  async postAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const announcements = await peopleService.postAnnouncement(req.body.title, req.body.body, (req as any).user?.id);
      sendSuccess(res, 201, { announcements }, 'Announcement posted');
    } catch (error) {
      next(error);
    }
  },

  async deleteAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const announcements = await peopleService.deleteAnnouncement(parseInt(req.params.id as string, 10));
      sendSuccess(res, 200, { announcements }, 'Announcement removed');
    } catch (error) {
      next(error);
    }
  },
};
