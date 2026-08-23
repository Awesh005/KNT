import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';

type Tab = 'images' | 'videos';

interface GalleryItem {
  id: number;
  url: string;
  title: string;
  isVideo?: boolean;
  videoUrl?: string;
}

export function Gallery() {
  const [activeTab, setActiveTab] = useState<Tab>('images');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  
  const { data } = useSWR('/cms/global/gallery', fetcher);
  const galleryData = data?.content || { images: [], videos: [] };

  const [currentData, setCurrentData] = useState<GalleryItem[]>([]);

  useEffect(() => {
    setCurrentData(activeTab === 'images' ? galleryData.images || [] : galleryData.videos || []);
  }, [activeTab, galleryData]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-deep-green text-white">
        <div className="absolute inset-0 z-0">
          <img loading="lazy" 
            src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1600" 
            alt="Gallery Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-green/80 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-goldenrod/30 mb-6 bg-deep-green/50 backdrop-blur-sm">
            <span className="text-goldenrod text-sm font-bold tracking-widest uppercase">
              OUR MOMENTS • OUR MEMORIES
            </span>
          </div>
          <Typography variant="h1" className="text-white text-5xl md:text-6xl lg:text-7xl mb-4 font-bold">
            Our Gallery
          </Typography>
          <Typography variant="body" className="text-white/90 text-lg md:text-xl">
            A glimpse into the lives we touch.
          </Typography>
        </div>
      </section>

      {/* Tabs */}
      <div className="container mx-auto px-4 -mt-8 relative z-20 flex justify-center mb-12">
        <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-lg border border-deep-green/10">
          <button
            onClick={() => setActiveTab('images')}
            className={`px-8 py-2.5 rounded-full font-semibold transition-all ${
              activeTab === 'images' 
                ? 'bg-deep-green text-white shadow-md' 
                : 'bg-transparent text-deep-green hover:bg-deep-green/5'
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-8 py-2.5 rounded-full font-semibold transition-all ${
              activeTab === 'videos' 
                ? 'bg-deep-green text-white shadow-md' 
                : 'bg-transparent text-deep-green hover:bg-deep-green/5'
            }`}
          >
            Videos
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {currentData.map((item, index) => (
            <motion.div
              key={`${activeTab}-${item.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => setSelectedItem(item)}
              className="relative group rounded-3xl overflow-hidden aspect-[4/3] cursor-pointer shadow-sm border border-deep-green/10"
            >
              <img loading="lazy" 
                src={getImageUrl(item.url)} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {item.title}
                </span>
              </div>

              {/* Video Play Button Overlay */}
              {activeTab === 'videos' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/50 group-hover:bg-goldenrod group-hover:border-goldenrod transition-colors shadow-lg">
                    <Play className="w-5 h-5 text-white fill-white ml-1" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
        
        {currentData.length === 0 && (
          <div className="text-center py-20 text-charcoal/60">
            No items found.
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/90 backdrop-blur-sm p-4 md:p-8"
            onClick={() => setSelectedItem(null)}
          >
            <button 
              className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-[110]"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem(null);
              }}
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative max-w-6xl w-full max-h-[90vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.isVideo && selectedItem.videoUrl ? (
                <video 
                  src={getImageUrl(selectedItem.videoUrl)} 
                  controls 
                  autoPlay 
                  className="w-full h-full max-h-[90vh] object-contain"
                />
              ) : (
                <img loading="lazy" 
                  src={getImageUrl(selectedItem.url)} 
                  alt={selectedItem.title}
                  className="w-full h-full max-h-[90vh] object-contain"
                />
              )}
              
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white text-xl md:text-2xl font-bold">{selectedItem.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
