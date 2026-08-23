import { Link } from 'react-router';
import { ArrowRight, Briefcase, CalendarCheck, ClipboardList, GraduationCap, Users, UserCog } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { useAuthStore } from '@/stores/authStore';

const hrSections = [
  {
    title: 'People',
    description: 'Members, volunteers, employees, attendance, leave, and announcements.',
    path: '/admin/people',
    icon: Users,
  },
  {
    title: 'Job Applications',
    description: 'Add walk-in applications or review submissions from the public careers page.',
    path: '/admin/applications',
    icon: Briefcase,
  },
  {
    title: 'Internship Applications',
    description: 'College internship applications from the public CSR page.',
    path: '/admin/internships',
    icon: GraduationCap,
  },
  {
    title: 'Attendance',
    description: 'Daily staff attendance and QR check-in records.',
    path: '/admin/people',
    icon: CalendarCheck,
  },
  {
    title: 'Leave',
    description: 'Approve leave requests and track employee balances.',
    path: '/admin/people',
    icon: ClipboardList,
  },
  {
    title: 'Users',
    description: 'Create, role-change, and manage admin panel user accounts.',
    path: '/admin/users',
    icon: UserCog,
    superAdminOnly: true,
  },
];

export function HrManagement() {
  const { user } = useAuthStore();
  const visibleSections = hrSections.filter((section) => !section.superAdminOnly || user?.role === 'Super Admin');

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
          HR Management
        </Typography>
        <Typography variant="body" className="text-charcoal/60 text-sm">
          People, hiring, attendance, and user accounts — one place for foundation staff work.
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {visibleSections.map((section) => (
          <Link
            key={section.title}
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
