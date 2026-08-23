"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_application_controller_1 = require("./job-application.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const job_application_validation_1 = require("./job-application.validation");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
const applicationUpload = upload_middleware_1.uploadJobApplicationFiles.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'aadhaar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'education', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'experienceDoc', maxCount: 1 },
    { name: 'caste', maxCount: 1 },
    { name: 'address', maxCount: 1 },
]);
router.post('/', applicationUpload, job_application_controller_1.jobApplicationController.createApplication);
router.use(auth_middleware_1.protect);
router.use((0, role_middleware_1.authorizeRoles)('Admin', 'Super Admin'));
router.post('/admin', applicationUpload, job_application_controller_1.jobApplicationController.createAdminApplication);
router.get('/', job_application_controller_1.jobApplicationController.getApplications);
router.get('/:id', (0, validate_middleware_1.validate)(job_application_validation_1.jobApplicationIdSchema), job_application_controller_1.jobApplicationController.getApplicationById);
router.patch('/:id/status', (0, validate_middleware_1.validate)(job_application_validation_1.updateJobApplicationStatusSchema), job_application_controller_1.jobApplicationController.updateStatus);
router.delete('/:id', (0, validate_middleware_1.validate)(job_application_validation_1.jobApplicationIdSchema), job_application_controller_1.jobApplicationController.deleteApplication);
exports.default = router;
