import { useState } from 'react';
import { Typography } from '@/components/common/Typography';
import { getImageUrl } from '@/utils/getImageUrl';
import type { Campaign } from '@/types';

interface CampaignStoryProps {
  campaign: Campaign;
}

export function CampaignStory({ campaign }: CampaignStoryProps) {
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);

  const getEmbedUrl = (url?: string | null) => {
    if (!url) return null;
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be')) {
        let videoId = '';
        if (parsedUrl.hostname.includes('youtu.be')) {
          videoId = parsedUrl.pathname.slice(1);
        } else if (parsedUrl.searchParams.has('v')) {
          videoId = parsedUrl.searchParams.get('v') || '';
        } else if (parsedUrl.pathname.includes('/embed/')) {
          return url;
        }
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(campaign.videoUrl);

  return (
    <div>
      <Typography variant="h3" className="mb-6">The Story</Typography>
      {campaign.videoUrl && campaign.videoUrl.startsWith('/uploads/') ? (
        <div className="mb-8 aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-charcoal/10 bg-black">
          <video 
            src={getImageUrl(campaign.videoUrl)} 
            controls 
            className="w-full h-full object-contain"
          />
        </div>
      ) : embedUrl ? (
        <div className="mb-8 aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-charcoal/10">
          <iframe 
            src={embedUrl} 
            title="Campaign Video" 
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>
      ) : null}
      <div className="prose max-w-none text-charcoal/80 leading-relaxed space-y-4 text-[16px]">
        <p className={`whitespace-pre-wrap transition-all duration-300 ${!isStoryExpanded ? 'line-clamp-4' : ''}`}>
          {campaign.story}
        </p>
        <button 
          onClick={() => setIsStoryExpanded(!isStoryExpanded)}
          className="text-goldenrod font-bold uppercase tracking-wider text-[12px] hover:text-deep-green transition-colors mt-2"
        >
          {isStoryExpanded ? 'Read Less' : 'Read More'}
        </button>
      </div>
    </div>
  );
}
