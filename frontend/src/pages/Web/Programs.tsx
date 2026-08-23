import { motion } from 'framer-motion';
import { Typography } from '@/components/common/Typography';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Link } from 'react-router';
import { 
  GraduationCap, Sprout, Baby, Users, Hospital, BookOpen, 
  Wrench, HeartHandshake, Tractor, Flower2, Droplet, Home 
} from 'lucide-react';

const iconMap: Record<string, any> = {
  'graduation-cap': <GraduationCap className="w-4 h-4 text-white" />,
  'sprout': <Sprout className="w-4 h-4 text-white" />,
  'baby': <Baby className="w-4 h-4 text-white" />,
  'users': <Users className="w-4 h-4 text-white" />,
  'hospital': <Hospital className="w-4 h-4 text-white" />,
  'book-open': <BookOpen className="w-4 h-4 text-white" />,
  'wrench': <Wrench className="w-4 h-4 text-white" />,
  'heart-handshake': <HeartHandshake className="w-4 h-4 text-white" />,
  'tractor': <Tractor className="w-4 h-4 text-white" />,
  'flower2': <Flower2 className="w-4 h-4 text-white" />,
  'droplet': <Droplet className="w-4 h-4 text-white" />,
  'home': <Home className="w-4 h-4 text-white" />
};

export function Programs() {
  const { data } = useSWR('/cms/global/programs', fetcher);
  const programs = data?.content || [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Header Section */}
      <div className="bg-deep-green text-white py-20 px-4 sm:px-6 lg:px-8 mb-16 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-goldenrod/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-charcoal/40 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <Typography 
            variant="small" 
            className="text-goldenrod font-bold tracking-[0.2em] mb-4 uppercase"
          >
            Our Initiatives
          </Typography>
          <Typography 
            variant="h1" 
            className="text-white text-4xl md:text-5xl lg:text-6xl mb-6 !leading-[1.15]"
          >
            Programs & Activities
          </Typography>
          <Typography 
            variant="body" 
            className="text-white/80 max-w-2xl mx-auto text-lg"
          >
            Discover our dynamic support programs designed to bring hope, healing, and holistic care to those who need it most.
          </Typography>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Reference Image Title equivalent */}
        <div className="text-center mb-16">
          <Typography variant="h2" className="text-deep-green text-3xl md:text-4xl uppercase tracking-[0.05em]">
            All Projects At A Glance
          </Typography>
          <div className="w-24 h-1 bg-goldenrod mx-auto mt-6 rounded-full" />
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {programs.map((program: any) => (
            <motion.div 
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Link 
                to={`/programs/${program.id}`}
                className="group flex flex-col h-full bg-white rounded-2xl border border-deep-green/10 shadow-sm hover:shadow-[0_20px_48px_rgba(15,26,22,0.08)] transition-all overflow-hidden cursor-pointer"
              >
                <div className="flex items-center p-5 border-b border-deep-green/10">
                  <h3 className="text-deep-green font-bold text-[13px] uppercase tracking-[0.1em] leading-tight">
                    {program.title}
                  </h3>
                </div>

                {/* Card Image */}
                <div className="relative w-full h-56 overflow-hidden bg-charcoal/5 shrink-0">
                  <img loading="lazy" 
                    src={program.image} 
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-deep-green/90 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                    {iconMap[program.icon] || <HeartHandshake className="w-4 h-4 text-white" />}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-grow flex flex-col">
                  <p className="text-charcoal/70 text-[14px] leading-relaxed flex-grow">
                    {program.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
