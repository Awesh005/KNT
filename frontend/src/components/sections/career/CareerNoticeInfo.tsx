import { Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export function CareerNoticeInfo() {
  const { data } = useSWR('/cms/global/career_notice', fetcher);
  
  const publicNotice = data?.content?.publicNotice || '';
  const keyInformation = data?.content?.keyInformation || [];

  const applicationProcess = [
    "Step 1: Check the Available Vacancies above.",
    "Step 2: Read the necessary qualifications matching your skillset.",
    "Step 3: Click on the 'Apply Now' button against your desired job.",
    "Step 4: Fill out the application form with accurate details and upload required documents.",
    "Step 5: Submit the form. Our HR team will contact shortlisted candidates via email/phone."
  ];

  const requiredDocuments = [
    "Latest Passport Size Photograph",
    "Aadhaar Card Copy",
    "PAN Card Copy (Optional but recommended)",
    "Educational Certificates",
    "Updated Resume / CV",
    "Experience Certificates (if applicable)",
    "Address Proof"
  ];

  const importantInstructions = [
    "Ensure all provided information is accurate.",
    "Only PDF, JPG, and PNG formats are accepted for documents.",
    "Max file size for any upload is 5MB.",
    "Shortlisted candidates will be required to present original documents during the interview.",
    "The Foundation reserves the right to accept or reject any application without assigning reasons."
  ];

  return (
    <div className="mb-16 space-y-12">
      {/* Public Notice */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-charcoal/10">
        <Typography variant="h3" className="text-2xl font-bold text-deep-green mb-4 border-b pb-4">
          Mega Job Offer / Employment Notice - 2026
        </Typography>
        <p className="text-charcoal/80 text-lg leading-relaxed whitespace-pre-wrap">{publicNotice}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Key Information */}
        <div className="bg-soft-green rounded-3xl p-8">
          <Typography variant="h3" className="text-xl font-bold text-deep-green mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" /> Key Information
          </Typography>
          <ul className="space-y-4">
            {keyInformation.map((info: any, idx: number) => (
              <li key={idx} className="flex flex-col sm:flex-row sm:gap-4 border-b border-deep-green/10 pb-3 last:border-0 last:pb-0">
                <span className="font-bold text-deep-green min-w-[120px]">{info.label}:</span>
                <span className="text-charcoal/80">{info.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Application Process */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-charcoal/10">
          <Typography variant="h3" className="text-xl font-bold text-deep-green mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Application Process
          </Typography>
          <ul className="space-y-4">
            {applicationProcess.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-goldenrod text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span className="text-charcoal/80">{step.replace(`Step ${idx + 1}: `, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Required Documents & Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-charcoal/10">
          <Typography variant="h3" className="text-xl font-bold text-deep-green mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5" /> Required Documents
          </Typography>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 list-disc pl-5">
            {requiredDocuments.map((doc, idx) => (
              <li key={idx} className="text-charcoal/80">{doc}</li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 rounded-3xl p-8 border border-red-100">
          <Typography variant="h3" className="text-xl font-bold text-red-700 mb-6 flex items-center gap-2">
            Important Instructions
          </Typography>
          <ul className="space-y-3 list-disc pl-5">
            {importantInstructions.map((inst, idx) => (
              <li key={idx} className="text-red-900/80 text-sm">{inst}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
