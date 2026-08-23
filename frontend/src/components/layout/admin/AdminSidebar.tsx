import { NavLink, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  HeartHandshake, 
  Users, 
  Award,
  Settings,
  X,
  CreditCard,
  MessageSquare,
  FileText,
  ArrowLeft,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: HeartHandshake, label: 'Campaigns', path: '/admin/campaigns' },
  { icon: Award, label: 'Requests', path: '/admin/requests' },
  { icon: CreditCard, label: 'Donations', path: '/admin/donations' },
  { icon: Users, label: 'Donors', path: '/admin/donors' },
  { icon: FileText, label: 'Donation Register', path: '/admin/register' },
  { icon: FileText, label: 'Finance', path: '/admin/finance' },
  { icon: FileText, label: '80G Certificates', path: '/admin/80g' },
  { icon: MessageSquare, label: 'Enquiries', path: '/admin/enquiries' },
  { icon: FileText, label: 'Office', path: '/admin/office' },
  { icon: LayoutDashboard, label: 'Insights', path: '/admin/insights' },
  { icon: MessageSquare, label: 'Comms', path: '/admin/comms' },
  { icon: Briefcase, label: 'HR Management', path: '/admin/hr' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
  { icon: FileText, label: 'CMS Management', path: '/admin/cms' },
];

const hrItems = [
  { label: 'People', path: '/admin/people' },
  { label: 'Job Applications', path: '/admin/applications' },
  { label: 'Internships', path: '/admin/internships' },
  { label: 'Users', path: '/admin/users', superAdminOnly: true },
];

const cmsItems = [
  { label: 'Leadership', path: '/admin/cms/leadership' },
  { label: 'Certificates', path: '/admin/cms/certificates' },
  { label: 'Partners', path: '/admin/cms/partners' },
  { label: 'Programs', path: '/admin/cms/programs' },
  { label: 'Careers', path: '/admin/cms/careers' },
  { label: 'CSR Internships', path: '/admin/cms/csr' },
  { label: 'Gallery', path: '/admin/cms/gallery' },
  { label: 'About', path: '/admin/cms/about' },
  { label: 'Featured Moments', path: '/admin/cms/featured-moments' },
  { label: 'Blog / News', path: '/admin/cms/blog' },
  { label: 'Vision & Mission', path: '/admin/cms/vision-mission' },
  { label: 'Testimonials', path: '/admin/cms/testimonials' },
  { label: 'Policies', path: '/admin/cms/policies' },
];

export function AdminSidebar({ isOpen, setIsOpen, isMobile }: AdminSidebarProps) {
  const { user: currentUser } = useAuthStore();
  const location = useLocation();
  const isAdmin = currentUser?.role === 'Admin';
  const isCmsSection = location.pathname.startsWith('/admin/cms');
  const isHrSection =
    location.pathname.startsWith('/admin/hr') ||
    location.pathname.startsWith('/admin/people') ||
    location.pathname.startsWith('/admin/applications') ||
    location.pathname.startsWith('/admin/internships') ||
    location.pathname.startsWith('/admin/users');

  const visibleNavItems = navItems.filter(item => {
    if (isAdmin) {
      return item.label !== 'Settings';
    }
    return true;
  });

  const sidebarTitle = isCmsSection ? 'KNT CMS' : isHrSection ? 'KNT HR' : 'KNT ADMIN';

  const visibleCmsItems = cmsItems.filter(item => {
    if (isAdmin) {
      // Admin can only see Programs, Gallery, Featured Moments
      return ['Programs', 'Gallery', 'Featured Moments', 'Blog / News'].includes(item.label);
    }
    return true;
  });

  const visibleHrItems = hrItems.filter((item) => !item.superAdminOnly || !isAdmin);

  const linkClass = (isActive: boolean, muted = false) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
      isActive
        ? muted
          ? 'bg-goldenrod/20 text-goldenrod shadow-md'
          : 'bg-goldenrod text-white shadow-md'
        : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`;

  const labelClass = `font-medium whitespace-nowrap transition-all duration-300 ${!isOpen && !isMobile ? 'opacity-0 w-0 hidden' : 'opacity-100 block'}`;
  const iconClass = `shrink-0 ${!isOpen && !isMobile ? 'mx-auto w-6 h-6' : 'w-5 h-5'}`;
  
  const sidebarContent = (
    <div className="flex flex-col h-full bg-deep-green text-white shadow-xl">
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <img src="/KNT-Logo.png" alt="Logo" className="w-10 h-10 bg-white rounded-full p-1 object-contain" />
          <span className={`font-bold tracking-wider transition-opacity duration-300 ${!isOpen && !isMobile ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            {sidebarTitle}
          </span>
        </div>
        
        {isMobile && (
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
        {isCmsSection ? (
          <>
            <NavLink
              to="/admin/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-white/70 hover:bg-white/10 hover:text-white"
              title={!isOpen && !isMobile ? 'Back to Admin Panel' : undefined}
            >
              <ArrowLeft className={iconClass} />
              <span className={labelClass}>Back to Admin Panel</span>
            </NavLink>

            <div className={`pt-4 pb-2 mt-4 border-t border-white/10 ${!isOpen && !isMobile ? 'hidden' : 'block'}`}>
              <span className="px-3 text-xs font-bold text-white/40 uppercase tracking-wider">CMS Management</span>
            </div>

            <NavLink
              to="/admin/cms"
              end
              className={({ isActive }) => linkClass(isActive)}
              title={!isOpen && !isMobile ? 'Overview' : undefined}
            >
              <FileText className={iconClass} />
              <span className={labelClass}>Overview</span>
            </NavLink>

            {visibleCmsItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => linkClass(isActive, true)}
              >
                <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${!isOpen && !isMobile ? 'mx-auto' : ''}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                </div>
                <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${!isOpen && !isMobile ? 'opacity-0 w-0 hidden' : 'opacity-100 block'}`}>
                  {item.label}
                </span>
              </NavLink>
            ))}
          </>
        ) : isHrSection ? (
          <>
            <NavLink
              to="/admin/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-white/70 hover:bg-white/10 hover:text-white"
              title={!isOpen && !isMobile ? 'Back to Admin Panel' : undefined}
            >
              <ArrowLeft className={iconClass} />
              <span className={labelClass}>Back to Admin Panel</span>
            </NavLink>

            <div className={`pt-4 pb-2 mt-4 border-t border-white/10 ${!isOpen && !isMobile ? 'hidden' : 'block'}`}>
              <span className="px-3 text-xs font-bold text-white/40 uppercase tracking-wider">HR Management</span>
            </div>

            <NavLink
              to="/admin/hr"
              end
              className={({ isActive }) => linkClass(isActive)}
              title={!isOpen && !isMobile ? 'Overview' : undefined}
            >
              <Briefcase className={iconClass} />
              <span className={labelClass}>Overview</span>
            </NavLink>

            {visibleHrItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => linkClass(isActive, true)}
              >
                <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${!isOpen && !isMobile ? 'mx-auto' : ''}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                </div>
                <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${!isOpen && !isMobile ? 'opacity-0 w-0 hidden' : 'opacity-100 block'}`}>
                  {item.label}
                </span>
              </NavLink>
            ))}
          </>
        ) : (
          visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => linkClass(isActive)}
              title={!isOpen && !isMobile ? item.label : undefined}
            >
              <item.icon className={iconClass} />
              <span className={labelClass}>{item.label}</span>
            </NavLink>
          ))
        )}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className={`text-xs text-center text-white/50 transition-opacity duration-300 ${!isOpen && !isMobile ? 'opacity-0 hidden' : 'opacity-100'}`}>
          KNT World Welfare © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[280px] z-50"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop Sidebar
  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${isOpen ? 'w-[260px]' : 'w-[80px]'}`}
    >
      {sidebarContent}
    </aside>
  );
}
