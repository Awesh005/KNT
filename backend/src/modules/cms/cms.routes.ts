import { Router } from 'express';
import { cmsController } from './cms.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { cmsUpdateSchema } from './cms.validation';
import { uploadCertificate, uploadTeamMember, uploadCampaignImage, uploadCampaignVideo, uploadProgramImage, uploadFeaturedImage, uploadGalleryImage, uploadGalleryVideo, uploadPolicyDocument } from '../../middleware/upload.middleware';

import { ForbiddenError } from '../../utils/errors';
import { Request, Response, NextFunction } from 'express';

const router = Router();

const authorizeCms = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).user?.role;
  if (role === 'Super Admin') return next();
  
  if (role === 'Admin') {
    const { pageKey, sectionKey } = req.params;
    const requestPath = req.path;
    
    if (requestPath.includes('certificate') || requestPath.includes('team')) {
      return next(new ForbiddenError('Admin cannot modify these resources'));
    }

    const allowedKeys = ['programs', 'gallery', 'featured-moments', 'featured_moments', 'blog'];
    if (typeof pageKey === 'string' && allowedKeys.includes(pageKey)) {
      return next();
    }
    if (pageKey === 'global' && typeof sectionKey === 'string' && allowedKeys.includes(sectionKey)) {
      return next();
    }
    
    return next(new ForbiddenError(`Admin is not allowed to modify CMS page: ${pageKey}`));
  }
  
  return next(new ForbiddenError('Unauthorized'));
};

// Public: Anyone can view CMS content
router.get('/:pageKey/:sectionKey', cmsController.getContent);

// Protected: Only Admin/Super Admin can update CMS content (with restrictions for Admin)
router.use(protect);
router.use(authorizeCms);

router.put('/:pageKey/:sectionKey', validate(cmsUpdateSchema), cmsController.updateContent);

// Protected: Upload certificate image
router.post('/upload/certificate', uploadCertificate.single('certificate'), cmsController.uploadCertificate);
router.delete('/upload/certificate', cmsController.deleteCertificateFile);

// Protected: Upload team member image
router.post('/upload/team', uploadTeamMember.single('photo'), cmsController.uploadTeamMember);
router.delete('/upload/team', cmsController.deleteTeamMemberFile);

// Protected: Upload campaign image
router.post('/upload/campaign', uploadCampaignImage.single('coverImage'), cmsController.uploadCampaignImage);
router.delete('/upload/campaign', cmsController.deleteCampaignImage);

// Protected: Upload campaign video
router.post('/upload/campaign-video', uploadCampaignVideo.single('video'), cmsController.uploadCampaignVideo);
router.delete('/upload/campaign-video', cmsController.deleteCampaignVideo);

// Protected: Upload program image
router.post('/upload/program', uploadProgramImage.single('image'), cmsController.uploadProgramImage);
router.delete('/upload/program', cmsController.deleteProgramImage);

// Protected: Upload featured moment image
router.post('/upload/featured-moment', uploadFeaturedImage.single('image'), cmsController.uploadFeaturedImage);
router.delete('/upload/featured-moment', cmsController.deleteFeaturedImage);

// Protected: Upload gallery image
router.post('/upload/gallery-image', uploadGalleryImage.single('image'), cmsController.uploadGalleryImage);
router.delete('/upload/gallery-image', cmsController.deleteGalleryImage);

// Protected: Upload gallery video
router.post('/upload/gallery-video', uploadGalleryVideo.single('video'), cmsController.uploadGalleryVideo);
router.delete('/upload/gallery-video', cmsController.deleteGalleryVideo);

router.post('/upload/policy', uploadPolicyDocument.single('document'), cmsController.uploadPolicyDocument);
router.delete('/upload/policy', cmsController.deletePolicyDocument);

export default router;
