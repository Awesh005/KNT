import useSWR from 'swr';
import { motion, type Variants } from 'framer-motion';
import { Typography } from '@/components/common/Typography';
import { TestimonialCard } from '@/components/common/TestimonialCard';
import { fetcher } from '@/lib/fetcher';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const DEFAULT_TESTIMONIALS = [
  { name: 'Rahul Sharma', location: 'Delhi', review: "KNT World Welfare Foundation made it incredibly easy to raise funds for my father's surgery. The transparency is unmatched.", rating: 5 },
  { name: 'Anjali Verma', location: 'Mumbai', review: 'I donate regularly because I know exactly where my money is going. The platform is secure and trustworthy.', rating: 5 },
  { name: 'Dr. Ramesh', location: 'Bangalore', review: 'A fantastic platform bridging the gap between those who need help and those who want to give.', rating: 5 },
];

export function Testimonials() {
  const { data } = useSWR('/cms/global/testimonials', fetcher);
  const testimonials = Array.isArray(data?.content) && data.content.length > 0 ? data.content : DEFAULT_TESTIMONIALS;

  return (
    <section className="py-24 bg-light-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer} className="text-center mb-12">
          <motion.div variants={fadeInUp}><Typography variant="overline" className="text-goldenrod mb-2 block">Our Community</Typography></motion.div>
          <motion.div variants={fadeInUp}><Typography variant="h2" className="text-charcoal mb-4">What Our Users Say</Typography></motion.div>
          <motion.div variants={fadeInUp}>
            <Typography variant="body" className="max-w-2xl mx-auto text-charcoal/60">
              Join thousands of verified donors and campaigners who believe in making a difference.
            </Typography>
          </motion.div>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t: any, idx: number) => (
            <motion.div key={idx} variants={fadeInUp} className="h-full">
              <TestimonialCard {...t} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
