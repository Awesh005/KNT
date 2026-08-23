import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Users, Share2, Link2 } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/common/Card';
import type { Campaign } from '@/types';
import { getImageUrl } from '@/utils/getImageUrl';

interface CampaignGridProps {
  isLoading: boolean;
  campaigns: Campaign[];
  onClearFilters: () => void;
}

export function CampaignGrid({ isLoading, campaigns, onClearFilters }: CampaignGridProps) {
  const navigate = useNavigate();
  const [openShareId, setOpenShareId] = useState<string | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse bg-charcoal/5 rounded-2xl h-[450px]" />
        ))}
      </div>
    );
  }

  return (
    <>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {campaigns.map((campaign) => (
            <motion.div key={campaign.id} variants={itemVariants} layout="position">
              <Card 
                className="h-full flex flex-col group/card cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
              >
                <div className="relative h-56 overflow-hidden rounded-t-2xl">
                  <div className="absolute inset-0 bg-charcoal/10" />
                  <img loading="lazy" 
                    src={Array.isArray(campaign.coverImage) && campaign.coverImage.length > 0 
                      ? getImageUrl(campaign.coverImage[0]) 
                      : (campaign.coverImage ? getImageUrl(campaign.coverImage as unknown as string) : 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800')}
                    alt={campaign.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/95 backdrop-blur-sm text-charcoal px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] shadow-sm">
                      {campaign.category}
                    </span>
                    {campaign.status !== 'approved' && (
                      <span className="bg-charcoal/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] shadow-sm">
                        {campaign.status}
                      </span>
                    )}
                  </div>
                </div>
                
                <CardHeader className="border-b-0 pb-0 pt-6">
                  <Typography variant="h4" className="mb-2 line-clamp-2 leading-snug">{campaign.title}</Typography>
                  <Typography variant="small" className="text-charcoal/50">By {campaign.creatorName || campaign.createdBy}</Typography>
                </CardHeader>
                
                <CardBody className="flex-grow">
                  <Typography variant="body" className="line-clamp-3 mb-6 text-charcoal/70">
                    {campaign.story}
                  </Typography>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2 mt-auto">
                    <div className="flex justify-between items-end">
                      <Typography variant="small" className="font-bold text-deep-green">
                        ₹{(campaign.raisedAmount || 0).toLocaleString()}
                        <span className="text-charcoal/50 text-xs ml-1 font-normal">of ₹{(campaign.targetAmount || 0).toLocaleString()}</span>
                      </Typography>
                    </div>
                    <div className="w-full bg-charcoal/5 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-goldenrod h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, ((campaign.raisedAmount || 0) / (campaign.targetAmount || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </CardBody>
                
                <CardFooter className="bg-transparent border-t border-charcoal/5 flex items-center justify-between py-4">
                  <div className="flex items-center gap-2 text-charcoal bg-fog-gray px-3 py-1.5 rounded-full">
                    <Users className="w-4 h-4 text-goldenrod" />
                    <span className="text-[13px] font-bold">
                      {campaign.supportersCount || Math.floor(campaign.raisedAmount / 1500)} supporters
                    </span>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setOpenShareId(openShareId === campaign.id ? null : campaign.id);
                      }}
                      className="w-10 h-10 rounded-full bg-fog-gray flex items-center justify-center text-charcoal hover:bg-goldenrod hover:text-white transition-colors"
                      title="Share Campaign"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {openShareId === campaign.id && (
                      <div 
                        className="absolute bottom-12 right-0 flex flex-col gap-2 p-2 bg-white rounded-full shadow-lg border border-charcoal/10 z-20 animate-in fade-in slide-in-from-bottom-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* WhatsApp */}
                        <a 
                          href={`https://wa.me/?text=Check out this campaign: ${window.location.origin}/campaigns/${campaign.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                          title="Share on WhatsApp"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </a>
                        
                        {/* Facebook */}
                        <a 
                          href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/campaigns/${campaign.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                          title="Share on Facebook"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                        
                        {/* Copy Link */}
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + '/campaigns/' + campaign.id);
                            alert('Link copied to clipboard!');
                            setOpenShareId(null);
                          }}
                          className="w-8 h-8 rounded-full bg-[#8D5E56] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                          title="Copy Link"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {campaigns.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 px-4 border border-dashed border-charcoal/20 rounded-2xl mt-8"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-charcoal/5 mb-6 text-2xl">
            <span aria-hidden="true">🔍</span>
          </div>
          <Typography variant="h3" className="mb-3">No campaigns found</Typography>
          <Typography variant="body" className="max-w-md mx-auto text-charcoal/60">
            We couldn't find any campaigns matching your current filters. Try adjusting your search criteria or explore other categories.
          </Typography>
          <Button 
            variant="ghost" 
            className="mt-6"
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
        </motion.div>
      )}
    </>
  );
}
