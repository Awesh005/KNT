import { Link } from 'react-router';
import { ArrowRight, Briefcase, Building2, FileText, GalleryHorizontal, HeartHandshake, Image, Medal, Users } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { useAuthStore } from '@/stores/authStore';

const cmsSections = [
  {
    title: 'Leadership',
    description: 'Manage core team members displayed on the Leadership page.',
    path: '/admin/cms/leadership',
    icon: Users,
    superAdminOnly: true,
  },
  {
    title: 'Certificates',
    description: 'Update official certificates shown on the public website.',
    path: '/admin/cms/certificates',
    icon: Medal,
    superAdminOnly: true,
  },
  {
    title: 'Partners',
    description: 'Manage partner logos, names, and public partner content.',
    path: '/admin/cms/partners',
    icon: HeartHandshake,
    superAdminOnly: true,
  },
  {
    title: 'Programs',
    description: 'Create and edit program content for the programs section.',
    path: '/admin/cms/programs',
    icon: FileText,
  },
  {
    title: 'Careers',
    description: 'Maintain career openings and recruitment information.',
    path: '/admin/cms/careers',
    icon: Briefcase,
    superAdminOnly: true,
  },
  {
    title: 'CSR Internships',
    description: 'CSR page intro and college internship openings.',
    path: '/admin/cms/csr',
    icon: FileText,
    superAdminOnly: true,
  },
  {
    title: 'Gallery',
    description: 'Upload and organize public gallery images.',
    path: '/admin/cms/gallery',
    icon: GalleryHorizontal,
  },
  {
    title: 'About',
    description: 'Edit about page content and foundation information.',
    path: '/admin/cms/about',
    icon: Building2,
    superAdminOnly: true,
  },
  {
    title: 'Featured Moments',
    description: 'Manage featured moments displayed on the home page.',
    path: '/admin/cms/featured-moments',
    icon: Image,
  },
  {
    title: 'Blog / News',
    description: 'Publish news, stories, and awareness posts on the website.',
    path: '/admin/cms/blog',
    icon: FileText,
  },
  {
    title: 'Vision & Mission',
    description: 'Edit the Vision & Mission page content.',
    path: '/admin/cms/vision-mission',
    icon: FileText,
    superAdminOnly: true,
  },
  {
    title: 'Home Testimonials',
    description: 'Manage testimonials shown on the homepage.',
    path: '/admin/cms/testimonials',
    icon: FileText,
    superAdminOnly: true,
  },
  {
    title: 'Documents & Policies',
    description: 'Upload company profile, annual reports, and statutory policies.',
    path: '/admin/cms/policies',
    icon: FileText,
    superAdminOnly: true,
  },
];

export function CmsManagement() {
  const { user } = useAuthStore();
  const visibleSections = cmsSections.filter(section => !section.superAdminOnly || user?.role === 'Super Admin');

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
          CMS Management
        </Typography>
        <Typography variant="body" className="text-charcoal/60 text-sm">
          Choose a content section to update website pages and home page modules.
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {visibleSections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="group bg-white border border-charcoal/10 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-light-green text-deep-green flex items-center justify-center group-hover:bg-deep-green group-hover:text-white transition-colors">
                <section.icon className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-charcoal/30 group-hover:text-goldenrod group-hover:translate-x-1 transition-all" />
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-bold text-charcoal group-hover:text-deep-green transition-colors">
                {section.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-charcoal/60">
                {section.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
