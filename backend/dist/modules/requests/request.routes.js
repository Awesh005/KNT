"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const request_controller_1 = require("./request.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const request_validation_1 = require("./request.validation");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
// User routes
router.post('/upload', upload_middleware_1.uploadRequestDocument.single('document'), request_controller_1.requestController.uploadDocument);
router.post('/', (0, validate_middleware_1.validate)(request_validation_1.createRequestSchema), request_controller_1.requestController.createRequest);
router.get('/my-requests', request_controller_1.requestController.getMyRequests);
router.get('/:id', request_controller_1.requestController.getRequestById);
// Admin routes
router.get('/', (0, role_middleware_1.authorizeRoles)('Admin', 'Super Admin'), request_controller_1.requestController.getRequests);
router.patch('/:id/status', (0, role_middleware_1.authorizeRoles)('Admin', 'Super Admin'), (0, validate_middleware_1.validate)(request_validation_1.updateRequestStatusSchema), request_controller_1.requestController.updateStatus);
exports.default = router;
