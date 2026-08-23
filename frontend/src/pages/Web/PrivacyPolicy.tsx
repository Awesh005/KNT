import { PageBanner } from '@/components/common/PageBanner';
import { Typography } from '@/components/common/Typography';
import { ShieldCheck, Lock, Eye, FileText, Server, Bell, HelpCircle } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { ORG, getCompanyDetail } from '@/config/org';

export function PrivacyPolicy() {
  const { data } = useSWR('/cms/about/main', fetcher);
  const companyDetails = data?.content?.companyDetails || [];
  const address = getCompanyDetail(companyDetails, 'REGISTERED OFFICE', ORG.address);
  const email = getCompanyDetail(companyDetails, 'OFFICIAL EMAIL', ORG.email).split('\n')[0];

  const sections = [
    {
      icon: Eye,
      title: "1. Information We Collect",
      content: [
        "Personal Identification: Name, Email Address, Phone Number, Mailing Address, and PAN details (required for issuing 80G Tax Exemption Certificates).",
        "Financial Information: Payment transaction details, transaction reference IDs, and uploaded payment verification screenshots.",
        "Technical Data: IP address, browser type, device information, and site interaction logs for analytics and security."
      ]
    },
    {
      icon: Server,
      title: "2. How We Use Your Information",
      content: [
        "To process donations efficiently and generate legal 80G Tax Exemption Receipts.",
        "To verify fundraiser requests and communicate campaign progress updates.",
        "To maintain transparency, prevent fraudulent activities, and comply with government regulations.",
        "To send periodic updates regarding our welfare initiatives (you can opt out at any time)."
      ]
    },
    {
      icon: Lock,
      title: "3. Data Protection & Security",
      content: [
        "We implement industry-standard encryption protocols (SSL/TLS) to safeguard your sensitive financial and personal data.",
        "We do not sell, trade, or rent your personal identification information to third-party entities.",
        "Authorized staff members access sensitive data strictly on a need-to-know basis for verification purposes."
      ]
    },
    {
      icon: FileText,
      title: "4. 80G Tax Exemption & Statutory Compliance",
      content: [
        "As a registered non-profit organisation under the Income Tax Act, we report donation logs as mandated by law.",
        "PAN details provided by donors are exclusively submitted to Income Tax authorities for Form 10BD generation."
      ]
    },
    {
      icon: Bell,
      title: "5. Cookies & Tracking Technologies",
      content: [
        "Our website utilizes essential session cookies to enhance your browsing experience and store login sessions securely.",
        "You can manage cookie preferences directly through your browser settings."
      ]
    },
    {
      icon: HelpCircle,
      title: "6. Your Rights & Privacy Inquiries",
      content: [
        "You have the right to request access to, correction of, or deletion of your personal account data.",
        `For any privacy inquiries or data requests, please contact our Privacy Team at ${email}.`
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <PageBanner 
        title="Privacy Policy" 
        subtitle="Transparent policies protecting your data, privacy, and contributions."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Intro Card */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-charcoal/5 mb-12 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-deep-green/5 rounded-full blur-2xl" />
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-deep-green/10 text-deep-green flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="h2" className="text-2xl font-bold text-deep-green mb-1">
                KNT World Welfare Foundation Privacy Guarantee
              </Typography>
              <p className="text-sm font-semibold text-charcoal/50">
                Last Updated: August 2026
              </p>
            </div>
          </div>
          <Typography variant="body" className="text-charcoal/80 leading-relaxed font-medium">
            At KNT World Welfare Foundation, we respect your privacy and are committed to protecting your personal information. 
            This Privacy Policy outlines how we collect, store, handle, and protect your data when you interact with our platform.
          </Typography>
        </div>

        {/* Dynamic Sections */}
        <div className="space-y-8">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-charcoal/5 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-goldenrod/15 text-deep-green flex items-center justify-center shrink-0 font-bold">
                    <Icon className="w-5 h-5 text-deep-green" />
                  </div>
                  <Typography variant="h3" className="text-xl font-bold text-deep-green">
                    {section.title}
                  </Typography>
                </div>

                <ul className="space-y-3 pl-2">
                  {section.content.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-3 text-charcoal/80 text-sm font-medium leading-relaxed">
                      <span className="w-2 h-2 rounded-full bg-goldenrod mt-2 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Contact Footer Note */}
        <div className="mt-12 bg-deep-green text-white rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
          <Typography variant="h3" className="text-xl font-bold text-goldenrod mb-2">
            Have Questions About Privacy?
          </Typography>
          <p className="text-white/80 text-sm max-w-xl mx-auto mb-6">
            We are dedicated to maintaining complete transparency with our donors and beneficiaries.
          </p>
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-wider">
            <span>Email: <a href={`mailto:${email}`} className="text-goldenrod underline">{email}</a></span>
            <span className="hidden sm:inline">•</span>
            <span>Office: {address}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
