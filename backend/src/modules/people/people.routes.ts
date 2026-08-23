import { Router } from 'express';
import { peopleController } from './people.controller';
import { protect, optionalAuth } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const admin = [protect, authorizeRoles('Admin', 'Super Admin')];

router.post('/memberships', optionalAuth, peopleController.applyMembership);
router.post('/volunteers', optionalAuth, peopleController.applyVolunteer);
router.get('/verify/:code', peopleController.verify);

router.get('/me/membership', protect, peopleController.myMembership);
router.post('/me/membership/renew', protect, peopleController.renewMembership);
router.get('/me/volunteer', protect, peopleController.myVolunteer);
router.post('/me/volunteer/hours', protect, peopleController.logHours);
router.get('/me/employee', protect, peopleController.myEmployee);
router.post('/me/attendance', protect, peopleController.checkIn);
router.post('/me/leave', protect, peopleController.applyLeave);
router.get('/announcements', protect, peopleController.listAnnouncements);

router.get('/memberships', ...admin, peopleController.listMemberships);
router.post('/memberships/admin', ...admin, peopleController.createMembershipAdmin);
router.post('/memberships/reminders', ...admin, peopleController.sendReminders);
router.post('/memberships/:id/credentials', ...admin, peopleController.setMembershipCredentials);
router.post('/memberships/:id/id-card', ...admin, peopleController.reissueMembershipId);
router.post('/memberships/:id/decide', ...admin, peopleController.decideMembership);
router.get('/volunteers', ...admin, peopleController.listVolunteers);
router.post('/volunteers/admin', ...admin, peopleController.createVolunteerAdmin);
router.post('/volunteers/:id/credentials', ...admin, peopleController.setVolunteerCredentials);
router.post('/volunteers/:id/decide', ...admin, peopleController.decideVolunteer);
router.post('/volunteers/:id/assignments', ...admin, peopleController.addAssignment);
router.get('/employees', ...admin, peopleController.listEmployees);
router.post('/employees', ...admin, peopleController.createEmployee);
router.post('/employees/hire', ...admin, peopleController.hire);
router.post('/employees/:id/credentials', ...admin, peopleController.setEmployeeCredentials);
router.post('/employees/:id/docs', ...admin, peopleController.addDoc);
router.get('/attendance', ...admin, peopleController.listAttendance);
router.post('/attendance/admin', ...admin, peopleController.adminMarkAttendance);
router.get('/leave', ...admin, peopleController.listLeave);
router.post('/leave/admin', ...admin, peopleController.adminApplyLeave);
router.patch('/leave/:id', ...admin, peopleController.decideLeave);
router.post('/announcements', ...admin, peopleController.postAnnouncement);
router.delete('/announcements/:id', ...admin, peopleController.deleteAnnouncement);

export default router;
