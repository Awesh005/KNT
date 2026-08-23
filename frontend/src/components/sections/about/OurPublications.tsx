import { motion } from 'framer-motion';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { fetcher } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';
import type { PolicyDoc } from '@/types/policy.types';

export function OurPublications() {
  const { data, isLoading } = useSWR('/cms/global/policies', fetcher);
  const publications: PolicyDoc[] = (Array.isArray(data?.content) ? data.content : [])
    .filter((doc: PolicyDoc) => doc.type === 'Publications' && doc.visibility !== 'internal');

  return (
    <div className="mb-20">
      <div className="text-center mb-12">
        <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4">
          Our Publications & Books
        </Typography>
        <div className="w-24 h-1 bg-deep-green mx-auto rounded-full mb-8" />
      </div>

      {isLoading ? (
        <div className="text-center text-charcoal/50 py-12">Loading publications...</div>
      ) : publications.length === 0 ? (
        <div className="text-center text-charcoal/50 py-12 bg-white rounded-2xl border border-charcoal/10">
          Publications will appear here once uploaded in CMS → Documents & Policies.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white p-4 rounded-2xl shadow-md border border-charcoal/5 flex flex-col h-[500px]"
            >
              <h3 className="font-bold text-charcoal text-center text-sm md:text-base mb-3 line-clamp-1 border-b border-charcoal/10 pb-2">
                {book.title}
              </h3>
              <div className="flex-1 w-full bg-gray-50 rounded-xl overflow-hidden relative">
                <iframe
                  src={`${getImageUrl(book.fileUrl)}#view=FitH`}
                  className="absolute inset-0 w-full h-full border-0"
                  title={book.title}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
