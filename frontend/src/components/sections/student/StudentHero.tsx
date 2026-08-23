import { Typography } from '@/components/common/Typography';

export function StudentHero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-deep-green text-white">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[140%] rounded-full bg-goldenrod/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[120%] rounded-full bg-black/20 blur-[100px] pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
        <Typography variant="h1" className="text-white text-5xl md:text-6xl mb-6 font-bold !leading-tight">
          Empowering Futures Through Education
        </Typography>
        <Typography variant="body" className="text-white/80 text-lg md:text-xl mb-8">
          Meet the bright minds we are supporting. Read their stories, track their academic progress, and contribute to their dreams by sponsoring their educational journey.
        </Typography>
      </div>
    </section>
  );
}
