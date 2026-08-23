import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Menu, Bell, Search, LogOut, ChevronRight, User, Settings, LayoutDashboard, HeartHandshake, Award, CreditCard, Users, FileText } from 'lucide-react';
import useSWR from 'swr';
import { useAuthStore } from '@/stores/authStore';
import { fetcher } from '@/lib/fetcher';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

const searchableRoutes = [
  { title: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Campaigns', path: '/admin/campaigns', icon: HeartHandshake },
  { title: 'Requests', path: '/admin/requests', icon: Award },
  { title: 'Donations', path: '/admin/donations', icon: CreditCard },
  { title: 'Donors', path: '/admin/donors', icon: Users },
  { title: 'Donation Register', path: '/admin/register', icon: FileText },
  { title: 'Finance', path: '/admin/finance', icon: FileText },
  { title: '80G Certificates', path: '/admin/80g', icon: FileText },
  { title: 'HR Management', path: '/admin/hr', icon: Users },
  { title: 'Users', path: '/admin/users', icon: Users },
  { title: 'Settings', path: '/admin/settings', icon: Settings },
  { title: 'CMS Management', path: '/admin/cms', icon: FileText },
  { title: 'CMS: Leadership', path: '/admin/cms/leadership', icon: FileText },
  { title: 'CMS: Certificates', path: '/admin/cms/certificates', icon: FileText },
  { title: 'CMS: Partners', path: '/admin/cms/partners', icon: FileText },
  { title: 'CMS: Programs', path: '/admin/cms/programs', icon: FileText },
  { title: 'CMS: Careers', path: '/admin/cms/careers', icon: FileText },
  { title: 'CMS: CSR Internships', path: '/admin/cms/csr', icon: FileText },
  { title: 'CMS: Gallery', path: '/admin/cms/gallery', icon: FileText },
  { title: 'CMS: About', path: '/admin/cms/about', icon: FileText },
  { title: 'CMS: Featured Moments', path: '/admin/cms/featured-moments', icon: FileText },
  { title: 'CMS: Blog / News', path: '/admin/cms/blog', icon: FileText },
  { title: 'CMS: Policies', path: '/admin/cms/policies', icon: FileText },
  { title: 'Enquiries', path: '/admin/enquiries', icon: FileText },
  { title: 'People', path: '/admin/people', icon: Users },
  { title: 'Office', path: '/admin/office', icon: FileText },
  { title: 'Job Applications', path: '/admin/applications', icon: FileText },
  { title: 'Internship Applications', path: '/admin/internships', icon: FileText },
  { title: 'CMS: Vision & Mission', path: '/admin/cms/vision-mission', icon: FileText },
  { title: 'CMS: Testimonials', path: '/admin/cms/testimonials', icon: FileText },
];

export function AdminHeader({ toggleSidebar }: AdminHeaderProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: notificationData } = useSWR('/admin/notifications', fetcher, { refreshInterval: 60000 });
  const notifications = notificationData?.items || [];
  const notificationCount = notificationData?.counts?.total || 0;

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter search results
  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : searchableRoutes.filter(route => 
        route.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate a simple breadcrumb from the pathname
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumb = pathnames.map((path, index) => {
    const isLast = index === pathnames.length - 1;
    const title = path.charAt(0).toUpperCase() + path.slice(1);
    
    return (
      <span key={path} className="flex items-center text-sm">
        <span className={isLast ? 'font-bold text-charcoal' : 'text-charcoal/50'}>
          {title}
        </span>
        {!isLast && <ChevronRight className="w-4 h-4 mx-2 text-charcoal/30" />}
      </span>
    );
  });

  const navigateToResult = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchFocused || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        navigateToResult(searchResults[selectedIndex].path);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-charcoal/5 flex items-center justify-between px-4 lg:px-8 shadow-sm relative z-20">
      
      {/* Left side: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-xl text-charcoal hover:bg-light-green transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:flex items-center">
          {breadcrumb}
        </div>
      </div>

      {/* Right side: Search, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <div className="hidden sm:block relative" ref={searchRef}>
          <div className="flex items-center relative">
            <Search className="w-4 h-4 absolute left-3 text-charcoal/40" />
            <input 
              type="text" 
              placeholder="Search admin pages..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9 pr-4 py-2 bg-gray-50 border-0 rounded-full text-sm w-48 focus:w-64 focus:ring-2 focus:ring-deep-green/20 focus:bg-white outline-none transition-all"
            />
          </div>
          
          {/* Search Suggestions Dropdown */}
          {isSearchFocused && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-white border border-charcoal/10 rounded-2xl shadow-xl overflow-hidden py-2 z-50">
              {searchResults.length > 0 ? (
                <ul className="max-h-64 overflow-y-auto custom-scrollbar">
                  {searchResults.map((result, index) => (
                    <li key={result.path}>
                      <button
                        onClick={() => navigateToResult(result.path)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                          index === selectedIndex 
                            ? 'bg-light-green text-deep-green font-bold' 
                            : 'text-charcoal hover:bg-gray-50 font-medium'
                        }`}
                      >
                        <result.icon className={`w-4 h-4 ${index === selectedIndex ? 'text-deep-green' : 'text-charcoal/40'}`} />
                        {result.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-charcoal/50 text-center">
                  No pages found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-full text-charcoal/70 hover:bg-light-green hover:text-deep-green transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-goldenrod rounded-full border border-white text-[10px] font-bold text-white flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
          
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-charcoal/10 rounded-2xl shadow-xl overflow-hidden py-2 z-50">
              <div className="px-4 py-2 border-b border-charcoal/5 flex justify-between items-center">
                <span className="font-bold text-charcoal text-sm">Notifications</span>
                <span className="text-xs text-charcoal/50">{notificationCount} pending</span>
              </div>
              {notifications.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((item: { type: string; id: number | string; title: string; subtitle: string; createdAt: string; link: string }) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => { navigate(item.link); setIsNotificationOpen(false); }}
                      className="w-full text-left px-4 py-3 hover:bg-light-green/40 border-b border-charcoal/5 last:border-0"
                    >
                      <p className="text-sm font-bold text-charcoal">{item.title}</p>
                      <p className="text-xs text-charcoal/60 mt-1">{item.subtitle}</p>
                      <p className="text-[10px] text-charcoal/40 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <Bell className="w-8 h-8 text-charcoal/20 mx-auto mb-2" />
                  <p className="text-sm text-charcoal/50">You're all caught up!</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-charcoal/10 mx-1" />

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 pr-2 rounded-xl transition-colors"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-charcoal leading-none mb-1">{user?.name || 'Admin User'}</span>
              <span className="text-[11px] font-medium text-charcoal/50 leading-none">{user?.role || 'Administrator'}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-deep-green text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-charcoal/10 rounded-2xl shadow-xl overflow-hidden py-2 z-50">
              <div className="px-4 py-3 border-b border-charcoal/5 md:hidden">
                <span className="block text-sm font-bold text-charcoal">{user?.name || 'Admin User'}</span>
                <span className="block text-xs font-medium text-charcoal/50">{user?.role || 'Administrator'}</span>
              </div>
              
              <button 
                onClick={() => { setIsProfileOpen(false); navigate('/admin/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-charcoal/50" />
                Settings
              </button>
              <button 
                onClick={() => { setIsProfileOpen(false); navigate('/admin/profile'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-charcoal/50" />
                Profile
              </button>
              <button 
                onClick={() => { setIsProfileOpen(false); navigate('/admin/users'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-gray-50 transition-colors"
              >
                <Users className="w-4 h-4 text-charcoal/50" />
                Manage Users
              </button>
              <div className="h-px bg-charcoal/5 my-1" />
              <button 
                onClick={() => { setIsProfileOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
