import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { fetcher } from '@/lib/fetcher';

const DEFAULT = {
  title: 'Who We Are',
  paragraphs: [
    'KNT World Welfare Foundation is a non-profit, non-religious and humanitarian organization committed to the holistic development of society. We work across key sectors including education, health, agriculture, women empowerment, child protection, elderly care, rural development, environment conservation, and spiritual enrichment.',
    'Our vision is to create an empowered, sustainable, and value-driven society where every individual has the opportunity to live with dignity and purpose.',
  ],
};

export function WhoWeAre() {
  const { data } = useSWR('/cms/about/main', fetcher);
  const content = { ...DEFAULT, ...(data?.content?.whoWeAre || {}) };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 lg:p-16 border border-charcoal/5 mb-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-goldenrod/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <Typography variant="h2" className="text-deep-green font-bold text-3xl md:text-4xl">{content.title}</Typography>
        <div className="w-24 h-1 bg-goldenrod mx-auto rounded-full" />
        {content.paragraphs.map((paragraph: string, index: number) => (
          <p key={index} className="text-charcoal/80 text-lg md:text-xl leading-relaxed text-justify md:text-center">
            {index === 0 ? (
              <>
                <span className="font-bold text-deep-green">KNT World Welfare Foundation</span>{' '}
                {paragraph.replace(/^KNT World Welfare Foundation\s*/i, '')}
              </>
            ) : paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
