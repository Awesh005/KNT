import { PageBanner } from '@/components/common/PageBanner';
import { Typography } from '@/components/common/Typography';
import { FileText, CheckCircle2, HeartHandshake, ShieldAlert, Award, Scale, HelpCircle } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { ORG, getCompanyDetail } from '@/config/org';

export function TermsAndConditions() {
  const { data } = useSWR('/cms/about/main', fetcher);
  const companyDetails = data?.content?.companyDetails || [];
  const address = getCompanyDetail(companyDetails, 'REGISTERED OFFICE', ORG.address);
  const email = getCompanyDetail(companyDetails, 'OFFICIAL EMAIL', ORG.email).split('\n')[0];
  const phone = getCompanyDetail(companyDetails, 'CONTACT NUMBER', ORG.phone);

  const sections = [
    {
      icon: HeartHandshake,
      title: "1. Overview & Platform Purpose",
      content: [
        "KNT World Welfare Foundation is a non-profit welfare organisation facilitating crowdfunding campaigns for medical emergencies, student education, disaster relief, and social causes.",
        "By accessing or using our platform, you agree to comply with and be bound by these Terms & Conditions."
      ]
    },
    {
      icon: CheckCircle2,
      title: "2. Donor Terms & Verification",
      content: [
        "Donations made through our platform are voluntary contributions towards verified charitable causes.",
        "Manual offline donations (UPI / Bank Transfer) require upload of a valid transaction reference (UTR) or screenshot for verification by our admin team.",
        "80G Tax Exemption Receipts are generated upon successful verification of verified donations."
      ]
    },
    {
      icon: ShieldAlert,
      title: "3. Fundraiser Campaign Requests",
      content: [
        "Users submitting fundraiser requests must provide accurate beneficiary details, valid medical or educational documentation, and true stories.",
        "Our admin panel reviews each campaign request before publishing. Misleading or fraudulent campaigns will be rejected and reported to law authorities.",
        "Funds raised are disbursed directly to verified hospital accounts, educational institutions, or beneficiary bank accounts."
      ]
    },
    {
      icon: Award,
      title: "4. 80G Tax Exemption Benefits",
      content: [
        "Eligible donations qualify for tax deductions under Section 80G of the Income Tax Act.",
        "Donors must provide accurate PAN details at the time of donation to ensure valid 80G certificates."
      ]
    },
    {
      icon: Scale,
      title: "5. Intellectual Property & Site Usage",
      content: [
        "All logos, trademarks, text, graphics, images, and software on this site belong to KNT World Welfare Foundation.",
        "Unauthorized copying, modification, or distribution of platform content is strictly prohibited."
      ]
    },
    {
      icon: HelpCircle,
      title: "6. Modifications & Contact Information",
      content: [
        "We reserve the right to modify these terms at any time. Changes will be updated on this page with immediate effect.",
        `For queries regarding these terms, contact us at ${email} or call ${phone}.`
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <PageBanner 
        title="Terms & Conditions" 
        subtitle="Guidelines and rules governing the use of KNT World Welfare Foundation platform."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Intro Card */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-charcoal/5 mb-12 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-goldenrod/10 rounded-full blur-2xl" />
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-deep-green/10 text-deep-green flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="h2" className="text-2xl font-bold text-deep-green mb-1">
                Terms of Use Agreement
              </Typography>
              <p className="text-sm font-semibold text-charcoal/50">
                Effective Date: August 2026
              </p>
            </div>
          </div>
          <Typography variant="body" className="text-charcoal/80 leading-relaxed font-medium">
            Welcome to KNT World Welfare Foundation. Please read these terms carefully before using our platform or making donations.
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
            Questions Regarding Our Terms?
          </Typography>
          <p className="text-white/80 text-sm max-w-xl mx-auto mb-6">
            We are always here to provide full clarity and answer your queries.
          </p>
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-wider">
            <span>Email: <a href={`mailto:${email}`} className="text-goldenrod underline">{email}</a></span>
            <span className="hidden sm:inline">•</span>
            <span>Phone: {phone}</span>
            <span className="hidden sm:inline">•</span>
            <span>Office: {address}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
