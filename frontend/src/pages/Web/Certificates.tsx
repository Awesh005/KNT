import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageBanner } from '@/components/common/PageBanner';
import { useCertificateStore } from '@/stores/certificateStore';
import { Loader2, X } from 'lucide-react';
import { getImageUrl } from '@/utils/getImageUrl';

export function Certificates() {
  const { certificates, isLoading, fetchCertificates } = useCertificateStore();
  const [selectedCert, setSelectedCert] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return (
    <div className="min-h-screen bg-light-green flex flex-col">
      <PageBanner 
        title="Our Certificates"
        subtitle="Scanned copies of our official certificates."
      />

      <section className="py-20 flex-1">
        <div className="container mx-auto px-4 max-w-7xl">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-deep-green" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {certificates.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-white rounded-[2rem] shadow-md border-2 border-deep-green overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedCert(cert.imageUrl)}
                >
                  <div className="p-6 flex-1 flex items-center justify-center bg-white min-h-[300px]">
                    <img loading="lazy" 
                      src={getImageUrl(cert.imageUrl)} 
                      alt={cert.title}
                      className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="bg-charcoal/10 p-4 text-center border-t-2 border-deep-green">
                    <h3 className="font-bold text-charcoal text-sm uppercase tracking-wider">
                      {cert.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {!isLoading && certificates.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              No certificates available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center bg-white rounded-xl overflow-hidden p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 p-2 bg-charcoal/50 hover:bg-charcoal text-white rounded-full transition-colors z-10"
                onClick={() => setSelectedCert(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <img loading="lazy" 
                src={getImageUrl(selectedCert)} 
                alt="Certificate Full View" 
                className="max-w-full max-h-[85vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
