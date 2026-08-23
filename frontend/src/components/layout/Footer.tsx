import { Link } from 'react-router';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { ORG, getCompanyDetail } from '@/config/org';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const { data } = useSWR('/cms/about/main', fetcher);
  const companyDetails = data?.content?.companyDetails || [];

  const address = getCompanyDetail(companyDetails, 'REGISTERED OFFICE', ORG.address);
  const phone = getCompanyDetail(companyDetails, 'CONTACT NUMBER', ORG.phone);
  const email = getCompanyDetail(companyDetails, 'OFFICIAL EMAIL', ORG.email).split('\n')[0];
  const cin = getCompanyDetail(companyDetails, 'CIN', ORG.cin);
  const csr = getCompanyDetail(companyDetails, 'CSR REG. NO.', ORG.csr);
  const pan = getCompanyDetail(companyDetails, 'PAN', ORG.pan);
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const mapQuery = encodeURIComponent(address);

  return (
    <footer className="bg-deep-green border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Intro */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2 group focus:outline-none inline-flex">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-inner overflow-hidden shrink-0 p-1">
                <img loading="lazy" src="/KNT-Logo.png" alt="KNT World Welfare Foundation" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col ml-1 justify-center">
                <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-white leading-none">
                  KNT WORLD WELFARE
                </span>
                <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-goldenrod mt-1">
                  FOUNDATION
                </span>
              </div>
            </Link>
            <Typography variant="body" className="max-w-xs !text-white/60">
              Empowering people to raise funds for medical emergencies, social causes, and life-changing events.
            </Typography>
          </div>

          {/* Quick Links */}
          <div>
            <Typography variant="overline" className="mb-4 text-goldenrod">Learn More</Typography>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/vision-mission" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">Vision & Mission</Link></li>
              <li><Link to="/partners" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">Our Partners</Link></li>
              <li><Link to="/news" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">News</Link></li>
              <li><Link to="/policies" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">Policies</Link></li>
              <li><Link to="/csr" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">CSR Internships</Link></li>
              <li><Link to="/leadership" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">Leadership</Link></li>
            </ul>
          </div>

          {/* Campaigns */}
          <div>
            <Typography variant="overline" className="mb-4 text-goldenrod">Discover</Typography>
            <ul className="space-y-3">
              <li><Link to="/membership" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">Membership</Link></li>
              <li><Link to="/volunteer" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">Volunteer</Link></li>
              <li><Link to="/impact" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">Impact</Link></li>
              <li><Link to="/donate" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">Donate</Link></li>
              <li><Link to="/campaigns?category=Medical" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">Medical Causes</Link></li>
              <li><Link to="/campaigns?category=Education" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">Education</Link></li>
              <li><Link to="/campaigns?category=Memorial" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">Memorial</Link></li>
              <li><Link to="/campaigns?category=Disaster Relief" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">Disaster Relief</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <Typography variant="overline" className="mb-4 text-goldenrod">Contact Us</Typography>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-goldenrod shrink-0 mt-0.5" />
                <a href={`mailto:${email}`} className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors break-all">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-goldenrod shrink-0 mt-0.5" />
                <a href={`tel:${cleanPhone}`} className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-goldenrod shrink-0 mt-0.5" />
                <a 
                  href={`https://maps.google.com/?q=${mapQuery}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors leading-relaxed"
                >
                  {address}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35 mb-8 leading-relaxed">
          CIN {cin} · PAN {pan} · CSR {csr}
        </p>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left text-xs text-white/40 flex flex-col sm:flex-row sm:items-center gap-2">
            <span>&copy; {currentYear} KNT World Welfare Foundation. All rights reserved.</span>
            <span className="hidden sm:inline">|</span>
            <span>
              Designed and developed by{' '}
              <a href="https://bnintelhub.com" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors font-bold">
                BN IntelHub
              </a>
            </span>
          </div>
          <div className="flex gap-6">
            <Link to="/terms" className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 hover:text-white transition-colors">Terms of Use</Link>
            <Link to="/privacy" className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/policies" className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 hover:text-white transition-colors">Policies</Link>
            <Link to="/admin/login" className="text-[10px] font-bold uppercase tracking-[0.16em] text-goldenrod hover:text-white transition-colors flex items-center gap-1">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
