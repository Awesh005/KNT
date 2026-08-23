import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Goal, TrendingUp, Target } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { sdgLabel } from '@/constants/sdg';

export function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useSWR('/cms/global/programs', fetcher);
  const programs = data?.content || [];
  const program = programs.find((p: any) => p.id === Number(id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-deep-green/20 border-t-deep-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center pt-20">
        <div className="text-center px-4">
          <Typography variant="h2" className="mb-4 text-deep-green">Project Not Found</Typography>
          <Typography variant="body" className="mb-8 text-charcoal/70">
            The project you're looking for doesn't exist or has been removed.
          </Typography>
          <Link to="/programs">
            <Button>Return to Programs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { detail } = program;

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-deep-green text-white">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[140%] rounded-full bg-goldenrod/10 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[120%] rounded-full bg-[#182822] blur-[100px] pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Link to="/programs" className="inline-flex items-center text-goldenrod hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium tracking-wider uppercase">Back to Programs</span>
          </Link>

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-goldenrod" />
                Project 0{program.id}
              </div>
              
              <Typography variant="h1" className="text-4xl md:text-5xl lg:text-6xl mb-6 !leading-[1.15] text-white">
                {program.title}
              </Typography>
              {Array.isArray(program.sdgTags) && program.sdgTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {program.sdgTags.map((code: string) => (
                    <span key={code} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold">
                      SDG {code} · {sdgLabel(String(code))}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm border-l-4 border-l-goldenrod">
                <p className="text-lg md:text-xl text-white/90 font-light italic leading-relaxed">
                  "{detail.quote}"
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:w-1/2 w-full"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl shadow-black/50 border border-white/10">
                <div className="absolute inset-0 bg-deep-green/20 mix-blend-multiply z-10" />
                <img loading="lazy" 
                  src={program.image} 
                  alt={program.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 z-20 w-12 h-12 rounded-full bg-goldenrod flex items-center justify-center text-deep-green shadow-lg">
                  {program.icon}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="max-w-5xl mx-auto">
          
          {/* Intro & Key Focus Areas */}
          <div className="flex flex-col md:flex-row gap-8 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:w-3/5 bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-deep-green/5 border border-deep-green/10"
            >
              <Typography variant="h3" className="text-deep-green mb-6 border-b border-deep-green/10 pb-4">
                Project Introduction
              </Typography>
              <p className="text-charcoal/80 text-lg leading-relaxed">
                {detail.introduction}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:w-2/5 bg-deep-green p-8 md:p-10 rounded-2xl shadow-xl text-white relative overflow-hidden"
            >
              {/* Decorative graphic */}
              <div className="absolute -right-12 -top-12 w-40 h-40 border-[30px] border-white/5 rounded-full" />
              
              <Typography variant="h3" className="text-white mb-6 relative z-10">
                Key Focus Areas
              </Typography>
              <ul className="space-y-5 relative z-10">
                {detail.keyFocusAreas.map((area: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-4 group">
                    <span className="w-8 h-8 rounded-full bg-goldenrod/20 text-goldenrod flex items-center justify-center text-sm font-bold shrink-0 border border-goldenrod/30 group-hover:bg-goldenrod group-hover:text-deep-green transition-colors">
                      {idx + 1}
                    </span>
                    <span className="text-white/90 font-medium">{area}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Details Grid (Objectives, Implementation, Budget, Impact) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            
            <DetailCard 
              title="Objectives" 
              icon={<Target className="w-6 h-6" />} 
              items={detail.objectives} 
              delay={0.1} 
            />
            
            <DetailCard 
              title="Implementation Plan" 
              icon={<Goal className="w-6 h-6" />} 
              items={detail.implementationPlan} 
              delay={0.2} 
            />
            
            <DetailCard 
              title="Budget & Investment Areas" 
              icon={<TrendingUp className="w-6 h-6" />} 
              items={detail.budgetAreas} 
              delay={0.3} 
            />
            
            <DetailCard 
              title="Expected Impact" 
              icon={<CheckCircle2 className="w-6 h-6" />} 
              items={detail.expectedImpact} 
              delay={0.4} 
            />

          </div>

          {/* Future Vision */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-goldenrod/10 border-l-4 border-l-goldenrod p-8 md:p-12 rounded-r-2xl relative overflow-hidden"
          >
            {/* Watermark icon */}
            <div className="absolute right-[-5%] top-[-10%] text-goldenrod/20 w-64 h-64 opacity-50 pointer-events-none">
              {program.icon}
            </div>
            
            <div className="relative z-10">
              <Typography variant="h3" className="text-deep-green mb-4">
                Future Vision & Expansion
              </Typography>
              <p className="text-charcoal/80 text-lg leading-relaxed max-w-3xl">
                {detail.futureVision}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

// Sub-component for the 2x2 grid cards
function DetailCard({ title, icon, items, delay }: { title: string, icon: React.ReactNode, items: string[], delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-white p-8 rounded-2xl shadow-sm border border-deep-green/10 hover:shadow-md transition-shadow h-full"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-deep-green/10 pb-4">
        <div className="w-12 h-12 rounded-xl bg-deep-green/5 text-deep-green flex items-center justify-center shrink-0">
          {icon}
        </div>
        <Typography variant="h4" className="text-deep-green">
          {title}
        </Typography>
      </div>
      <ul className="space-y-4">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-goldenrod shrink-0 mt-2.5" />
            <span className="text-charcoal/70 leading-relaxed text-sm md:text-base">{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
