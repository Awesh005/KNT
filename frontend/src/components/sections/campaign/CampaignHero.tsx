import { useState, useEffect } from 'react';
import { Typography } from '@/components/common/Typography';
import { Share2, ChevronLeft, ChevronRight, Link2, GraduationCap, Building2, TrendingUp } from 'lucide-react';
import type { Campaign, Donation } from '@/types';
import { getImageUrl } from '@/utils/getImageUrl';

interface CampaignHeroProps {
  campaign: Campaign;
  donations: Donation[];
}

export function CampaignHero({ campaign, donations }: CampaignHeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const rawImages = Array.isArray(campaign.coverImage) ? campaign.coverImage : (campaign.coverImage ? [campaign.coverImage as unknown as string] : []);
  const campaignImages = rawImages.length > 0 ? rawImages.map(getImageUrl) : ['https://images.unsplash.com/photo-1593113565214-80afcb4a4571?auto=format&fit=crop&q=80&w=800'];

  useEffect(() => {
    if (campaignImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev === campaignImages.length - 1 ? 0 : prev + 1));
    }, 4000);
    
    return () => clearInterval(interval);
  }, [campaignImages.length]);

  const progressPercentage = Math.min(100, (campaign.raisedAmount / campaign.targetAmount) * 100);

  return (
    <div className="space-y-10">
      {/* Title & Image */}
      <div className="space-y-6">
        <Typography variant="h1" className="text-4xl md:text-5xl !leading-[1.15]">
          {campaign.title}
        </Typography>
        
        <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_48px_rgba(15,26,22,0.15)] aspect-[16/9] bg-charcoal/5 group">
          <img 
            src={campaignImages[currentImageIndex]} 
            alt={campaign.title} 
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-white/95 backdrop-blur-sm text-charcoal px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] shadow-sm">
              {campaign.category}
            </span>
          </div>
          
          {/* Navigation Arrows */}
          <button 
            onClick={() => setCurrentImageIndex(prev => (prev === 0 ? campaignImages.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-charcoal hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentImageIndex(prev => (prev === campaignImages.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-charcoal hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {campaignImages.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Milaap Style Stats & Progress */}
      <div className="py-6 border-b border-charcoal/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Circular Progress */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-charcoal/10"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-goldenrod"
                  strokeDasharray={`${progressPercentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
              <div className="absolute text-[12px] font-bold text-charcoal">
                {Math.round(progressPercentage)}%
              </div>
            </div>
            
            {/* Amount */}
            <div>
              <div className="text-charcoal/60 text-[12px] mb-0.5 font-medium">Raised</div>
              <div className="text-deep-green font-bold text-xl md:text-2xl">
                ₹{(campaign.raisedAmount || 0).toLocaleString()}
              </div>
              <div className="text-charcoal/50 text-[13px]">
                of ₹{(campaign.targetAmount || 0).toLocaleString()}
              </div>
            </div>
          </div>
          
          {/* Supporters */}
          <div className="text-right">
            <div className="inline-block border-b border-charcoal/20 text-charcoal font-bold text-[14px]">
              {donations.length} supporters
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <a 
            href={`https://wa.me/?text=Check out this campaign: ${window.location.origin}/campaigns/${campaign.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-full font-bold hover:bg-[#20bd5a] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share
          </a>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(!isShareOpen);
              }}
              className="flex w-full items-center justify-center gap-2 border border-charcoal/20 text-charcoal py-3 rounded-full font-bold hover:bg-charcoal/5 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>

            {isShareOpen && (
              <div 
                className="absolute bottom-full right-0 mb-3 flex flex-row gap-3 p-3 bg-white rounded-full shadow-xl border border-charcoal/10 z-20 animate-in fade-in slide-in-from-bottom-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* WhatsApp */}
                <a 
                  href={`https://wa.me/?text=Check out this campaign: ${window.location.origin}/campaigns/${campaign.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                  title="Share on WhatsApp"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                
                {/* Facebook */}
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/campaigns/${campaign.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                  title="Share on Facebook"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                
                {/* Copy Link */}
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + '/campaigns/' + campaign.id);
                    alert('Link copied to clipboard!');
                    setIsShareOpen(false);
                  }}
                  className="w-10 h-10 rounded-full bg-[#8D5E56] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                  title="Copy Link"
                >
                  <Link2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Organizer */}
      <div className="flex items-center gap-4 py-6 border-b border-charcoal/10">
        <div className="w-12 h-12 rounded-full bg-deep-green flex items-center justify-center text-white font-serif text-xl">
          {(campaign.creatorName || campaign.createdBy).charAt(0).toUpperCase()}
        </div>
        <div>
          <Typography variant="small" className="text-charcoal/50 uppercase tracking-[0.1em] font-bold block mb-1">
            Organizer
          </Typography>
          <Typography variant="body" className="font-bold text-[14px]">
            {campaign.creatorName || campaign.createdBy}
          </Typography>
        </div>
      </div>

      {/* Student Details (if applicable) */}
      {campaign.studentDetails && (
        <div className="py-6 border-b border-charcoal/10 space-y-6">
          <Typography variant="h3">Student Profile</Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 text-charcoal/80">
              <GraduationCap className="w-5 h-5 text-goldenrod shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs uppercase tracking-wider font-bold text-deep-green mb-0.5">Course</span>
                <span className="font-medium">{campaign.studentDetails.course}</span>
              </div>
            </div>
            <div className="flex items-start gap-3 text-charcoal/80">
              <Building2 className="w-5 h-5 text-goldenrod shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs uppercase tracking-wider font-bold text-deep-green mb-0.5">Institution</span>
                <span className="font-medium text-sm">{campaign.studentDetails.institution}</span>
              </div>
            </div>
          </div>

          <div className="bg-fog-gray rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4 text-deep-green">
              <TrendingUp className="w-5 h-5" />
              <span className="font-bold text-[15px]">Recent Progress</span>
            </div>
            <ul className="space-y-3">
              {campaign.studentDetails.progressUpdates.map((update, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-charcoal/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-goldenrod shrink-0 mt-1.5" />
                  {update}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
