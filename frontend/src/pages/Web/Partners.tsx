import { Typography } from '@/components/common/Typography';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export function Partners() {
  const { data } = useSWR('/cms/global/partners', fetcher);
  const partnersData = data?.content || {};

  const sponsors = partnersData.sponsors?.map((p: any) => ({
    id: p.id, name: p.name, logo: p.logo, link: p.link || '#'
  })) || [];

  const hospitals = partnersData.hospitals?.map((p: any) => ({
    id: p.id, name: p.name, image: p.image, location: p.location || '', link: p.link || '#'
  })) || [];

  const ngos = partnersData.ngos?.map((p: any) => ({
    id: p.id, name: p.name, image: p.image, location: p.location || '', link: p.link || '#'
  })) || [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Header Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <Typography 
            variant="h1" 
            className="text-deep-green text-4xl md:text-5xl lg:text-6xl mb-6 !leading-[1.15]"
          >
            Our Partners & Collaborators
          </Typography>
          <div className="w-24 h-1 bg-goldenrod mx-auto mb-8 rounded-full" />
          <Typography variant="body" className="text-lg md:text-xl text-charcoal/70">
            We are proud to collaborate with leading organizations, hospitals, and NGOs 
            who share our vision of creating meaningful change and empowering communities.
          </Typography>
        </div>
      </section>

      {/* Marquee and Grid Sections */}
      <div className="space-y-24">
        <LogoMarquee title="Corporate Sponsors & Partners" items={sponsors as any} />
        <CardGrid title="Collaborating Hospitals" items={hospitals as any} />
        <CardGrid title="NGO Partners" items={ngos as any} />
      </div>
    </div>
  );
}

// Corporate Sponsors - Logos Only
interface LogoItem {
  id: number;
  name: string;
  logo: string;
  link: string;
}

function LogoMarquee({ title, items, reverse = false }: { title: string, items: LogoItem[], reverse?: boolean }) {
  // Only duplicate and animate if we have enough items to actually need a marquee
  const isMarquee = items.length > 4;
  const displayItems = isMarquee 
    ? [...items, ...items, ...items, ...items, ...items] 
    : items;

  const ensureAbsoluteUrl = (url: string) => {
    if (!url || url === '#') return '#';
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  return (
    <section>
      <div className="container mx-auto px-4 mb-8">
        <Typography variant="h3" className="text-deep-green text-center">
          {title}
        </Typography>
      </div>
      
      <div className="relative w-full overflow-hidden bg-white py-12 shadow-sm border-y border-deep-green/5">
        {isMarquee && (
          <>
            <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          </>
        )}
        
        <div 
          className={`flex items-center gap-20 ${isMarquee ? 'w-max animate-marquee' : 'justify-center flex-wrap px-4'}`}
          style={isMarquee ? { animationDirection: reverse ? 'reverse' : 'normal' } : {}}
        >
          {displayItems.map((partner, idx) => {
            const hasLink = partner.link && partner.link !== '#';
            return (
            <a 
              key={`${partner.id}-${idx}`} 
              href={hasLink ? ensureAbsoluteUrl(partner.link) : undefined}
              target={hasLink ? "_blank" : undefined}
              rel={hasLink ? "noopener noreferrer" : undefined}
              className={`group shrink-0 block transition-transform ${hasLink ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
              onClick={(e) => {
                if (!hasLink) e.preventDefault();
              }}
            >
              <img loading="lazy" 
                src={partner.logo} 
                alt={partner.name} 
                className={`h-24 md:h-32 w-auto object-contain transition-all ${hasLink ? 'hover:scale-105' : ''}`}
              />
            </a>
          )})}
        </div>
      </div>
    </section>
  );
}

// Hospitals and NGOs - Compact Cards
interface CardItem {
  id: number;
  name: string;
  image: string;
  location: string;
  link: string;
}

function CardGrid({ title, items }: { title: string, items: CardItem[] }) {
  const ensureAbsoluteUrl = (url: string) => {
    if (!url || url === '#') return '#';
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  return (
    <section>
      <div className="container mx-auto px-4 mb-12">
        <Typography variant="h3" className="text-deep-green text-center">
          {title}
        </Typography>
      </div>
      
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {items.map((partner, idx) => {
            const hasLink = partner.link && partner.link !== '#';
            return (
            <a 
              key={`${partner.id}-${idx}`} 
              href={hasLink ? ensureAbsoluteUrl(partner.link) : undefined}
              target={hasLink ? "_blank" : undefined}
              rel={hasLink ? "noopener noreferrer" : undefined}
              className={`group flex items-center gap-4 bg-white p-4 pr-6 rounded-full shadow-sm border border-deep-green/10 transition-all w-full max-w-sm ${hasLink ? 'cursor-pointer hover:border-goldenrod hover:shadow-md' : 'cursor-default'}`}
              onClick={(e) => {
                if (!hasLink) e.preventDefault();
              }}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                <img loading="lazy" 
                  src={partner.image} 
                  alt={partner.name} 
                  className={`w-full h-full object-cover transition-transform duration-500 ${hasLink ? 'group-hover:scale-110' : ''}`}
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-deep-green text-base font-bold truncate">
                  {partner.name}
                </span>
                <span className="text-charcoal/60 text-sm font-medium truncate">
                  {partner.location}
                </span>
              </div>
            </a>
          )})}
        </div>
      </div>
    </section>
  );
}
