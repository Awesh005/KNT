import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Search, Home, ArrowRight } from 'lucide-react';
import { Typography } from '@/components/common/Typography';

export function NotFound() {
  return (
    <div className="min-h-screen bg-light-green flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[60%] rounded-full bg-goldenrod/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[5%] w-[40%] h-[60%] rounded-full bg-deep-green/5 blur-[100px]" />
      </div>

      <div className="text-center max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 relative inline-block"
        >
          <div className="text-[12rem] md:text-[16rem] font-black leading-none text-deep-green/5 tracking-tighter select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center text-goldenrod border-4 border-deep-green">
              <Search className="w-10 h-10" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Typography variant="h2" className="text-3xl md:text-5xl font-bold text-charcoal mb-4">
            Oops! Page Not Found
          </Typography>
          <Typography variant="body" className="text-charcoal/70 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </Typography>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-deep-green text-white font-bold tracking-wide uppercase text-sm hover:bg-opacity-90 transition-all hover:-translate-y-1 shadow-[0_10px_20px_rgba(15,26,22,0.15)] hover:shadow-[0_15px_30px_rgba(15,26,22,0.25)] min-w-[200px]"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <Link 
              to="/campaigns" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-deep-green font-bold tracking-wide uppercase text-sm hover:bg-gray-50 transition-all border border-charcoal/10 hover:border-deep-green/30 shadow-sm min-w-[200px]"
            >
              Explore Causes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
