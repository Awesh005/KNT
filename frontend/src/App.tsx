import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { WebLayout } from '@/layouts/WebLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

// Eager imports for instantaneous navigation (eliminates Vite dev server waterfall delays)
import { Home } from '@/pages/Web/Home';
import { Campaigns } from '@/pages/Web/Campaigns';
import { CampaignDetail } from '@/pages/Web/CampaignDetail';
import { Programs } from '@/pages/Web/Programs';
import { ProgramDetail } from '@/pages/Web/ProgramDetail';
import { Partners } from '@/pages/Web/Partners';
import { Gallery } from '@/pages/Web/Gallery';
import { StudentSupport } from '@/pages/Web/StudentSupport';
import { About } from '@/pages/Web/About';
import { VisionMission } from '@/pages/Web/VisionMission';
import { Certificates } from '@/pages/Web/Certificates';
import { Leadership } from '@/pages/Web/Leadership';
import { Career } from '@/pages/Web/Career';
import { JobApplicationForm } from '@/pages/Web/JobApplicationForm';
import { Csr } from '@/pages/Web/Csr';
import { InternshipApplicationForm } from '@/pages/Web/InternshipApplicationForm';
import { StartFundraiser } from '@/pages/Web/StartFundraiser';
import { Contact } from '@/pages/Web/Contact';
import { Donate } from '@/pages/Web/Donate';
import { Membership } from '@/pages/Web/Membership';
import { Volunteer } from '@/pages/Web/Volunteer';
import { Verify } from '@/pages/Web/Verify';
import { Portal } from '@/pages/Web/Portal';
import { AttendanceCheckIn } from '@/pages/Web/AttendanceCheckIn';
import { News } from '@/pages/Web/News';
import { NewsDetail } from '@/pages/Web/NewsDetail';
import { Policies } from '@/pages/Web/Policies';
import { PrivacyPolicy } from '@/pages/Web/PrivacyPolicy';
import { TermsAndConditions } from '@/pages/Web/TermsAndConditions';
import { Login } from '@/pages/Web/Login';
import { Dashboard as WebDashboard } from '@/pages/Web/Dashboard';
import { NotFound } from '@/pages/Web/NotFound';
import { AdminLogin } from '@/pages/Admin/AdminLogin';
import { Dashboard as AdminDashboard } from '@/pages/Admin/Dashboard';
import { CampaignManagement } from '@/pages/Admin/CampaignManagement';
import { EditCampaign } from '@/pages/Admin/EditCampaign';
import { CampaignInsights } from '@/pages/Admin/CampaignInsights';
import { FundraiserRequests } from '@/pages/Admin/FundraiserRequests';
import { DonationManagement } from '@/pages/Admin/DonationManagement';
import { Enquiries } from '@/pages/Admin/Enquiries';
import { UserManagement } from '@/pages/Admin/UserManagement';
import { Profile } from '@/pages/Admin/Profile';
import { SettingsPage } from '@/pages/Admin/SettingsPage';
import { CmsManagement } from '@/pages/Admin/CMS/CmsManagement';
import { LeadershipCMS } from '@/pages/Admin/CMS/LeadershipCMS';
import { CertificatesCMS } from '@/pages/Admin/CMS/CertificatesCMS';
import { PartnersCMS } from '@/pages/Admin/CMS/PartnersCMS';
import { ProgramsCMS } from '@/pages/Admin/CMS/ProgramsCMS';
import { ProgramDetailCMS } from '@/pages/Admin/CMS/ProgramDetailCMS';
import { CareerCMS } from '@/pages/Admin/CMS/CareerCMS';
import { CsrCMS } from '@/pages/Admin/CMS/CsrCMS';
import { GalleryCMS } from '@/pages/Admin/CMS/GalleryCMS';
import { AboutCMS } from '@/pages/Admin/CMS/AboutCMS';
import { FeaturedMomentsCMS } from '@/pages/Admin/CMS/FeaturedMomentsCMS';
import { BlogCMS } from '@/pages/Admin/CMS/BlogCMS';
import { PoliciesCMS } from '@/pages/Admin/CMS/PoliciesCMS';
import { EightyGCertificates } from '@/pages/Admin/EightyGCertificates';
import { Donors } from '@/pages/Admin/Donors';
import { DonorDetail } from '@/pages/Admin/DonorDetail';
import { DonationRegister } from '@/pages/Admin/DonationRegister';
import { Finance } from '@/pages/Admin/Finance';
import { People } from '@/pages/Admin/People';
import { Office } from '@/pages/Admin/Office';
import { Insights } from '@/pages/Admin/Insights';
import { Impact } from '@/pages/Web/Impact';
import { Comms } from '@/pages/Admin/Comms';
import { DonateStatus } from '@/pages/Web/DonateStatus';
import { VerifyEmail } from '@/pages/Web/VerifyEmail';
import { ForgotPassword, ResetPassword } from '@/pages/Web/ForgotPassword';
import { JobApplications } from '@/pages/Admin/JobApplications';
import { InternApplications } from '@/pages/Admin/InternApplications';
import { VisionMissionCMS } from '@/pages/Admin/CMS/VisionMissionCMS';
import { TestimonialsCMS } from '@/pages/Admin/CMS/TestimonialsCMS';
import { HrManagement } from '@/pages/Admin/HrManagement';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />
      <Routes>
        {/* Public Web Routes */}
        <Route element={<WebLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<WebDashboard />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/start-fundraiser" element={<StartFundraiser />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:id" element={<ProgramDetail />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/student-support" element={<StudentSupport />} />
          <Route path="/about" element={<About />} />
          <Route path="/vision-mission" element={<VisionMission />} />
          <Route path="/certificate" element={<Certificates />} />
          <Route path="/leadership" element={<Leadership />} />
          <Route path="/career" element={<Career />} />
          <Route path="/apply/:jobId" element={<JobApplicationForm />} />
          <Route path="/csr" element={<Csr />} />
          <Route path="/csr/apply/:id" element={<InternshipApplicationForm />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/donate/status/:id" element={<DonateStatus />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/members/verify/:id" element={<Verify />} />
          <Route path="/verify/:code" element={<Verify />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/attendance/check-in" element={<AttendanceCheckIn />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Login (Outside Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Super Admin']} redirectPath="/admin/login" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="campaigns" element={<CampaignManagement />} />
            <Route path="campaigns/:id/edit" element={<EditCampaign />} />
            <Route path="campaigns/:id/manage" element={<CampaignInsights />} />
            <Route path="requests" element={<FundraiserRequests />} />
            <Route path="donations" element={<DonationManagement />} />
            <Route path="donors" element={<Donors />} />
            <Route path="donors/:key" element={<DonorDetail />} />
            <Route path="register" element={<DonationRegister />} />
            <Route path="finance" element={<Finance />} />
            <Route path="people" element={<People />} />
            <Route path="office" element={<Office />} />
            <Route path="insights" element={<Insights />} />
            <Route path="comms" element={<Comms />} />
            <Route path="80g" element={<EightyGCertificates />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="applications" element={<JobApplications />} />
            <Route path="internships" element={<InternApplications />} />
            <Route path="hr" element={<HrManagement />} />
            <Route path="profile" element={<Profile />} />
            {/* CMS Routes available to Admin & Super Admin */}
            <Route path="cms" element={<CmsManagement />} />
            <Route path="cms/programs" element={<ProgramsCMS />} />
            <Route path="cms/programs/:id" element={<ProgramDetailCMS />} />
            <Route path="cms/featured-moments" element={<FeaturedMomentsCMS />} />
            <Route path="cms/gallery" element={<GalleryCMS />} />
            <Route path="cms/blog" element={<BlogCMS />} />
            <Route path="cms/vision-mission" element={<VisionMissionCMS />} />
            <Route path="cms/testimonials" element={<TestimonialsCMS />} />

            {/* Super Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Super Admin']} redirectPath="/admin/dashboard" />}>
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="cms/leadership" element={<LeadershipCMS />} />
              <Route path="cms/certificates" element={<CertificatesCMS />} />
              <Route path="cms/partners" element={<PartnersCMS />} />
              <Route path="cms/careers" element={<CareerCMS />} />
              <Route path="cms/csr" element={<CsrCMS />} />
              <Route path="cms/about" element={<AboutCMS />} />
              <Route path="cms/policies" element={<PoliciesCMS />} />
            </Route>
            
            {/* Future Admin Routes will go here */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
