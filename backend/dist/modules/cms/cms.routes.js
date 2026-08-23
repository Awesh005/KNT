"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cms_controller_1 = require("./cms.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const cms_validation_1 = require("./cms.validation");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const errors_1 = require("../../utils/errors");
const router = (0, express_1.Router)();
const authorizeCms = (req, res, next) => {
    const role = req.user?.role;
    if (role === 'Super Admin')
        return next();
    if (role === 'Admin') {
        const { pageKey, sectionKey } = req.params;
        const requestPath = req.path;
        if (requestPath.includes('certificate') || requestPath.includes('team')) {
            return next(new errors_1.ForbiddenError('Admin cannot modify these resources'));
        }
        const allowedKeys = ['programs', 'gallery', 'featured-moments', 'featured_moments', 'blog'];
        if (typeof pageKey === 'string' && allowedKeys.includes(pageKey)) {
            return next();
        }
        if (pageKey === 'global' && typeof sectionKey === 'string' && allowedKeys.includes(sectionKey)) {
            return next();
        }
        return next(new errors_1.ForbiddenError(`Admin is not allowed to modify CMS page: ${pageKey}`));
    }
    return next(new errors_1.ForbiddenError('Unauthorized'));
};
// Public: Anyone can view CMS content
router.get('/:pageKey/:sectionKey', cms_controller_1.cmsController.getContent);
// Protected: Only Admin/Super Admin can update CMS content (with restrictions for Admin)
router.use(auth_middleware_1.protect);
router.use(authorizeCms);
router.put('/:pageKey/:sectionKey', (0, validate_middleware_1.validate)(cms_validation_1.cmsUpdateSchema), cms_controller_1.cmsController.updateContent);
// Protected: Upload certificate image
router.post('/upload/certificate', upload_middleware_1.uploadCertificate.single('certificate'), cms_controller_1.cmsController.uploadCertificate);
router.delete('/upload/certificate', cms_controller_1.cmsController.deleteCertificateFile);
// Protected: Upload team member image
router.post('/upload/team', upload_middleware_1.uploadTeamMember.single('photo'), cms_controller_1.cmsController.uploadTeamMember);
router.delete('/upload/team', cms_controller_1.cmsController.deleteTeamMemberFile);
// Protected: Upload campaign image
router.post('/upload/campaign', upload_middleware_1.uploadCampaignImage.single('coverImage'), cms_controller_1.cmsController.uploadCampaignImage);
router.delete('/upload/campaign', cms_controller_1.cmsController.deleteCampaignImage);
// Protected: Upload campaign video
router.post('/upload/campaign-video', upload_middleware_1.uploadCampaignVideo.single('video'), cms_controller_1.cmsController.uploadCampaignVideo);
router.delete('/upload/campaign-video', cms_controller_1.cmsController.deleteCampaignVideo);
// Protected: Upload program image
router.post('/upload/program', upload_middleware_1.uploadProgramImage.single('image'), cms_controller_1.cmsController.uploadProgramImage);
router.delete('/upload/program', cms_controller_1.cmsController.deleteProgramImage);
// Protected: Upload featured moment image
router.post('/upload/featured-moment', upload_middleware_1.uploadFeaturedImage.single('image'), cms_controller_1.cmsController.uploadFeaturedImage);
router.delete('/upload/featured-moment', cms_controller_1.cmsController.deleteFeaturedImage);
// Protected: Upload gallery image
router.post('/upload/gallery-image', upload_middleware_1.uploadGalleryImage.single('image'), cms_controller_1.cmsController.uploadGalleryImage);
router.delete('/upload/gallery-image', cms_controller_1.cmsController.deleteGalleryImage);
// Protected: Upload gallery video
router.post('/upload/gallery-video', upload_middleware_1.uploadGalleryVideo.single('video'), cms_controller_1.cmsController.uploadGalleryVideo);
router.delete('/upload/gallery-video', cms_controller_1.cmsController.deleteGalleryVideo);
router.post('/upload/policy', upload_middleware_1.uploadPolicyDocument.single('document'), cms_controller_1.cmsController.uploadPolicyDocument);
router.delete('/upload/policy', cms_controller_1.cmsController.deletePolicyDocument);
exports.default = router;
