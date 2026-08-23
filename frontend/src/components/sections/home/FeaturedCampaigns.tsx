import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Button } from '@/components/common/Button';
import { Typography } from '@/components/common/Typography';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/common/Card';
import { CategoryPills } from '@/components/common/CategoryPills';
import { Input } from '@/components/common/Input';
import { Search, ChevronLeft, ChevronRight, Share2, Users, Link2 } from 'lucide-react';
import { getImageUrl } from '@/utils/getImageUrl';
import type { Campaign } from '@/types';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export function FeaturedCampaigns() {
  const { data, isLoading } = useSWR('/campaigns?is_featured=true&limit=10', fetcher);
  const campaigns: Campaign[] = (data?.campaigns || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    story: c.story,
    coverImage: c.cover_image,
    targetAmount: Number(c.target_amount),
    raisedAmount: Number(c.raised_amount),
    deadline: c.deadline,
    status: c.status,
    createdBy: c.created_by,
    category: c.category,
    isUrgent: c.is_urgent,
    isFeatured: c.is_featured,
    createdAt: c.created_at
  }));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openShareId, setOpenShareId] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!openShareId) return;
    const handleScrollOrClick = () => setOpenShareId(null);
    window.addEventListener('scroll', handleScrollOrClick, { capture: true });
    window.addEventListener('click', handleScrollOrClick);
    return () => {
      window.removeEventListener('scroll', handleScrollOrClick, { capture: true });
      window.removeEventListener('click', handleScrollOrClick);
    };
  }, [openShareId]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const firstChild = sliderRef.current.firstElementChild as HTMLElement;
      const scrollAmount = firstChild ? firstChild.offsetWidth + 32 : sliderRef.current.clientWidth + 32;
      const { scrollLeft: currentScroll, scrollWidth } = sliderRef.current;
      
      if (currentScroll <= 5) {
        // Loop to end
        sliderRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
      } else {
        sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const firstChild = sliderRef.current.firstElementChild as HTMLElement;
      const scrollAmount = firstChild ? firstChild.offsetWidth + 32 : sliderRef.current.clientWidth + 32;
      const { scrollLeft: currentScroll, scrollWidth, clientWidth } = sliderRef.current;
      
      if (Math.ceil(currentScroll + clientWidth) >= scrollWidth - 5) {
        // Loop to start
        sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Reset slider scroll position when filters change
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = 0;
    }
  }, [selectedCategory, searchQuery]);

  // Filter campaigns based on search query and category
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            campaign.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? campaign.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [campaigns, searchQuery, selectedCategory]);

  return (
    <section className="py-24 w-full bg-deep-green relative overflow-hidden my-12 rounded-[3rem] mx-4 max-w-[calc(100%-2rem)] md:mx-auto md:max-w-[calc(100%-4rem)] xl:max-w-7xl">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-goldenrod/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Typography variant="overline" className="text-goldenrod mb-3 block">Discover</Typography>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Typography variant="h2" className="text-white mb-4">Featured Causes</Typography>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Typography variant="body" className="max-w-2xl mx-auto text-white/80">
              Browse our verified campaigns and extend your support to families navigating medical emergencies and social challenges.
            </Typography>
          </motion.div>
          <motion.div variants={fadeInUp} className="mt-8 mb-4 max-w-2xl mx-auto px-4 sm:px-0">
            <div className="relative mb-8">
              <Input
                placeholder="Search by fundraiser name, title, or keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 rounded-full text-[14px] bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-goldenrod"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            </div>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="mb-4">
            <Typography variant="body" className="font-bold text-white mb-4 text-center">Browse by Cause</Typography>
            <CategoryPills 
              selectedCategory={selectedCategory} 
              onSelect={(cat) => setSelectedCategory(prev => prev === cat ? null : cat)} 
            />
          </motion.div>
        </motion.div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white/5 rounded-2xl h-[450px]" />
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <Typography variant="body" className="text-white/60">
            No campaigns found matching your criteria.
          </Typography>
          <Button 
            variant="ghost" 
            className="mt-4 text-white hover:bg-white/10" 
            onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="relative group/slider">
          {filteredCampaigns.length > 3 && (
            <>
              <button onClick={scrollLeft} className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-charcoal/10 rounded-full shadow-lg flex items-center justify-center text-deep-green hover:text-goldenrod transition-colors opacity-0 group-hover/slider:opacity-100 disabled:opacity-0">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={scrollRight} className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-charcoal/10 rounded-full shadow-lg flex items-center justify-center text-deep-green hover:text-goldenrod transition-colors opacity-0 group-hover/slider:opacity-100 disabled:opacity-0">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <motion.div 
            key={(selectedCategory || 'all') + '-' + searchQuery}
            ref={sliderRef}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-8 pb-16 pt-4 -mb-8"
          >
            {filteredCampaigns.slice(0, 6).map((campaign) => (
              <motion.div key={campaign.id} variants={fadeInUp} className="h-full w-full md:w-[calc(33.333%-1.333rem)] flex-shrink-0 snap-start">
                <Card 
                  className="h-full flex flex-col group/card cursor-pointer hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                >
                <div className="relative h-48 sm:h-56 overflow-hidden rounded-t-[1.5rem]">
                  <div className="absolute inset-0 bg-charcoal/10" />
                  <img loading="lazy" 
                    src={Array.isArray(campaign.coverImage) && campaign.coverImage.length > 0 
                      ? getImageUrl(campaign.coverImage[0]) 
                      : (campaign.coverImage ? getImageUrl(campaign.coverImage as unknown as string) : 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800')}
                    alt={campaign.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-charcoal px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em]">
                      {campaign.category}
                    </span>
                  </div>
                </div>
                
                <CardHeader className="border-b-0 pb-0">
                  <Typography variant="h4" className="mb-2 line-clamp-2">{campaign.title}</Typography>
                  <Typography variant="small" className="text-charcoal/50">By {campaign.creatorName || campaign.createdBy}</Typography>
                </CardHeader>
                
                <CardBody className="flex-grow">
                  <Typography variant="body" className="line-clamp-3 mb-6">
                    {campaign.story}
                  </Typography>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <Typography variant="small" className="font-bold text-deep-green">
                        ₹{(campaign.raisedAmount || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="small" className="text-charcoal/50">
                        of ₹{(campaign.targetAmount || 0).toLocaleString()}
                      </Typography>
                    </div>
                    <div className="w-full bg-charcoal/5 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-goldenrod h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (campaign.raisedAmount / campaign.targetAmount) * 100)}%` }}
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
          </motion.div>
        </div>
      )}
      
      <div className="mt-12 text-center">
        <Link to="/campaigns">
          <Button variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:border-white/40 hover:text-white">View All Campaigns</Button>
        </Link>
      </div>
      </div>
    </section>
  );
}
