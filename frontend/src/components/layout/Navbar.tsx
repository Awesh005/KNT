import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Heart,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Building2,
  Target,
  HeartHandshake,
  Award,
  Users as UsersIcon,
  Briefcase,
  FileText,
  Images,
  GraduationCap,
  Landmark,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/common/Button';
import { useUIStore } from '@/stores/uiStore';
import { dashboardPath } from '@/utils/portal';
import { useAuthStore } from '@/stores/authStore';

type SubLink = { name: string; path: string; icon: typeof Building2 };
type NavLink = { name: string; path: string; dropdown?: SubLink[] };

const aboutLinks: SubLink[] = [
  { name: 'About Us', path: '/about', icon: Building2 },
  { name: 'Vision & Mission', path: '/vision-mission', icon: Target },
  { name: 'Leadership', path: '/leadership', icon: UsersIcon },
  { name: 'Partners', path: '/partners', icon: HeartHandshake },
  { name: 'Certificates', path: '/certificate', icon: Award },
  { name: 'CSR Internships', path: '/csr', icon: Landmark },
  { name: 'Gallery', path: '/gallery', icon: Images },
  { name: 'Policies', path: '/policies', icon: FileText },
];

const programLinks: SubLink[] = [
  { name: 'Our Programs', path: '/programs', icon: Heart },
  { name: 'Student Support', path: '/student-support', icon: GraduationCap },
  { name: 'Membership', path: '/membership', icon: UsersIcon },
  { name: 'Volunteer', path: '/volunteer', icon: HeartHandshake },
  { name: 'Careers', path: '/career', icon: Briefcase },
  { name: 'CSR Internships', path: '/csr', icon: Landmark },
];

const desktopLinks: NavLink[] = [
  { name: 'About', path: '/about', dropdown: aboutLinks },
  { name: 'Campaigns', path: '/campaigns' },
  { name: 'Programs', path: '/programs', dropdown: programLinks },
  { name: 'News', path: '/news' },
  { name: 'Contact', path: '/contact' },
];

const mobileLinks: NavLink[] = [
  { name: 'Home', path: '/' },
  ...desktopLinks,
];

const linkClass = (active: boolean) =>
  cn(
    'whitespace-nowrap px-2.5 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors',
    active ? 'text-deep-green bg-light-green' : 'text-charcoal/70 hover:text-charcoal hover:bg-fog-gray'
  );

function isDropdownActive(pathname: string, items: SubLink[]) {
  return items.some((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) toggleMobileMenu();
    setOpenMobileSection(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white',
        isScrolled ? 'shadow-sm' : 'shadow-[0_1px_0_rgba(15,26,22,0.06)]'
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
        <div className="h-[72px] flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group focus:outline-none min-w-0">
            <img src="/KNT-Logo.png" alt="KNT World Welfare Foundation" className="w-11 h-11 object-contain" />
            <div className="hidden sm:flex flex-col justify-center">
              <span className="font-bold text-[13px] tracking-wide text-deep-green leading-none">
                KNT WORLD WELFARE
              </span>
              <span className="text-[8px] font-bold tracking-[0.22em] text-goldenrod uppercase mt-1">
                Foundation
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-0.5">
            {desktopLinks.map((link) => {
              if (link.dropdown) {
                const active = isDropdownActive(location.pathname, link.dropdown);
                return (
                  <div key={link.name} className="relative group">
                    <button type="button" className={cn(linkClass(active), 'inline-flex items-center gap-1')}>
                      {link.name}
                      <ChevronDown className="w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform" />
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                      <div className="w-56 bg-white border border-charcoal/10 rounded-2xl shadow-xl overflow-hidden py-2">
                        {link.dropdown.map((subItem) => {
                          const Icon = subItem.icon;
                          const subActive = location.pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={cn(
                                'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors',
                                subActive
                                  ? 'bg-light-green text-deep-green'
                                  : 'text-charcoal hover:bg-fog-gray'
                              )}
                            >
                              <Icon className="w-4 h-4 text-deep-green shrink-0" />
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={linkClass(location.pathname === link.path || location.pathname.startsWith(`${link.path}/`))}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {isAuthenticated && user ? (
              <>
                <div className="relative group">
                  <button
                    type="button"
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-fog-gray transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-light-green text-deep-green flex items-center justify-center">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <span className="max-w-[110px] truncate text-xs font-semibold text-charcoal">{user.name}</span>
                    <ChevronDown className="w-3 h-3 text-charcoal/50" />
                  </button>
                  <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    <div className="w-48 bg-white border border-charcoal/10 rounded-xl shadow-lg p-2">
                      <Link
                        to={dashboardPath(user.role)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-charcoal hover:bg-fog-gray rounded-lg font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        {['Admin', 'Super Admin'].includes(user.role) ? 'Admin Panel' : 'Dashboard'}
                      </Link>
                      <button
                        type="button"
                        onClick={() => logout()}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="!px-4 !py-2 whitespace-nowrap" onClick={() => navigate('/donate')}>
                  <Heart className="w-3.5 h-3.5 text-goldenrod fill-current" />
                  Donate
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[11px] font-semibold uppercase tracking-[0.08em] text-charcoal/70 hover:text-charcoal px-2 py-2 whitespace-nowrap"
                >
                  Login
                </Link>
                <Button size="sm" className="!px-4 !py-2 whitespace-nowrap" onClick={() => navigate('/donate')}>
                  <Heart className="w-3.5 h-3.5 text-goldenrod fill-current" />
                  Donate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="!px-4 !py-2 whitespace-nowrap hidden xl:inline-flex"
                  onClick={() => navigate('/start-fundraiser')}
                >
                  Fundraise
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={toggleMobileMenu}
            className="lg:hidden ml-auto p-2 -mr-2 text-charcoal/70 hover:text-charcoal hover:bg-fog-gray rounded-full transition-colors focus:outline-none"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t border-charcoal/10 max-h-[calc(100vh-72px)] overflow-y-auto"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {mobileLinks.map((link) => {
                if (link.dropdown) {
                  const open = openMobileSection === link.name;
                  return (
                    <div key={link.name}>
                      <button
                        type="button"
                        onClick={() => setOpenMobileSection(open ? null : link.name)}
                        className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-charcoal hover:bg-fog-gray"
                      >
                        {link.name}
                        <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
                      </button>
                      {open && (
                        <div className="ml-3 pl-3 border-l border-charcoal/10 flex flex-col gap-0.5 mb-1">
                          {link.dropdown.map((subItem) => {
                            const Icon = subItem.icon;
                            return (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                onClick={toggleMobileMenu}
                                className={cn(
                                  'flex items-center gap-2 p-2.5 rounded-lg text-sm',
                                  location.pathname === subItem.path
                                    ? 'bg-light-green text-deep-green font-semibold'
                                    : 'text-charcoal/70 hover:bg-fog-gray'
                                )}
                              >
                                <Icon className="w-4 h-4" />
                                {subItem.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={toggleMobileMenu}
                    className={cn(
                      'p-3 rounded-xl text-sm font-semibold',
                      location.pathname === link.path
                        ? 'bg-light-green text-deep-green'
                        : 'text-charcoal hover:bg-fog-gray'
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}

              <div className="h-px bg-charcoal/10 my-3" />

              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-fog-gray rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-charcoal">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold text-charcoal truncate">{user.name}</span>
                      <span className="block text-xs text-charcoal/50 truncate">{user.email}</span>
                    </div>
                  </div>
                  <Link
                    to={dashboardPath(user.role)}
                    onClick={toggleMobileMenu}
                    className="p-3 rounded-xl text-sm font-medium text-charcoal hover:bg-fog-gray flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {['Admin', 'Super Admin'].includes(user.role) ? 'Admin Panel' : 'Dashboard'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      toggleMobileMenu();
                    }}
                    className="p-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={toggleMobileMenu}
                  className="p-3 rounded-xl text-sm font-medium text-charcoal hover:bg-fog-gray"
                >
                  Login
                </Link>
              )}

              <Button
                className="w-full mt-2"
                onClick={() => {
                  navigate('/donate');
                  toggleMobileMenu();
                }}
              >
                <Heart className="w-4 h-4 fill-current" /> Donate
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigate('/start-fundraiser');
                  toggleMobileMenu();
                }}
              >
                Start a Fundraiser
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
