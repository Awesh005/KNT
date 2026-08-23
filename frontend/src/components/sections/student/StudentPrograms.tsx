import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, CheckCircle2, TrendingUp, IndianRupee } from 'lucide-react';
import type { Campaign } from '@/types';
import { getImageUrl } from '@/utils/getImageUrl';

interface StudentProgramsProps {
  campaigns: Campaign[];
}

export function StudentPrograms({ campaigns }: StudentProgramsProps) {
  // Filter campaigns that are in the Education category and have student details
  const studentCampaigns = campaigns.filter(c => c.category === 'Education' && c.studentDetails);

  return (
    <div className="container mx-auto px-4 -mt-10 relative z-20">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {studentCampaigns.map((campaign, index) => {
          const progressPercent = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));
          const isFunded = progressPercent >= 100;
          const student = campaign.studentDetails!;
          // Using a fallback name if we assume title has the name (just a mock behavior fallback)
          const studentName = campaign.title.replace(/Support |'s Education|'s Medical Education/g, '');

          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-deep-green/5 border border-deep-green/10 flex flex-col group hover:shadow-xl transition-all"
            >
              <Link to={`/campaigns/${campaign.id}`} className="flex flex-col h-full">
                {/* Header Image */}
                <div className="relative h-48 overflow-hidden shrink-0">
                  <img loading="lazy" 
                    src={Array.isArray(campaign.coverImage) && campaign.coverImage.length > 0 
                      ? getImageUrl(campaign.coverImage[0]) 
                      : (campaign.coverImage ? getImageUrl(campaign.coverImage as unknown as string) : 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800')}
                    alt={campaign.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Status Badge */}
                  {isFunded && (
                    <div className="absolute top-4 right-4 bg-deep-green text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> Fully Funded
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">{studentName}</h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 flex-grow flex flex-col">
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 text-charcoal/80">
                      <GraduationCap className="w-5 h-5 text-goldenrod shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-xs uppercase tracking-wider font-bold text-deep-green mb-0.5">Course</span>
                        <span className="font-medium">{student.course}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-charcoal/80">
                      <Building2 className="w-5 h-5 text-goldenrod shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-xs uppercase tracking-wider font-bold text-deep-green mb-0.5">Institution</span>
                        <span className="font-medium text-sm">{student.institution}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Updates */}
                  <div className="bg-soft-green rounded-2xl p-4 mb-6 flex-grow">
                    <div className="flex items-center gap-2 mb-3 text-deep-green">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-bold text-sm">Recent Progress</span>
                    </div>
                    <ul className="space-y-2">
                      {student.progressUpdates.map((update, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-charcoal/70">
                          <span className="w-1.5 h-1.5 rounded-full bg-goldenrod shrink-0 mt-1.5" />
                          {update}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Funding Bar */}
                  <div className="mt-auto">
                    <div className="flex justify-between text-sm mb-2 font-bold">
                      <span className="text-charcoal flex items-center"><IndianRupee className="w-3 h-3" />{(campaign.raisedAmount || 0).toLocaleString('en-IN')} Raised</span>
                      <span className="text-charcoal/50 flex items-center"><IndianRupee className="w-3 h-3" />{(campaign.targetAmount || 0).toLocaleString('en-IN')} Goal</span>
                    </div>
                    <div className="w-full bg-soft-green rounded-full h-2.5 overflow-hidden mb-4">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isFunded ? 'bg-deep-green' : 'bg-goldenrod'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm font-bold text-deep-green group-hover:text-goldenrod transition-colors">
                      <span>View Campaign &rarr;</span>
                      <span>{progressPercent}%</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
