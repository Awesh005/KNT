import { Link } from 'react-router';
import useSWR from 'swr';
import { MapPin } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { Typography } from '@/components/common/Typography';
import { getImageUrl } from '@/utils/getImageUrl';
import { formatCompactCurrency, formatCurrency } from '@/utils/formatters';
import { osmEmbedUrl, sdgLabel } from '@/constants/sdg';

export function Impact() {
  const { data: stats } = useSWR('/donations/stats', fetcher);
  const { data: sdgData } = useSWR('/impact/sdg', fetcher);
  const sdg = sdgData?.sdg || [];

  return (
    <div className="min-h-screen bg-light-green pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-goldenrod mb-3">Live impact</p>
        <Typography variant="h1" className="text-deep-green mb-4">How funds are used</Typography>
        <p className="text-charcoal/70 max-w-2xl mb-10">
          These numbers come from verified donations, tagged projects, and published progress updates — not static marketing copy.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Stat label="Raised" value={formatCompactCurrency(stats?.totalRaised || 0)} />
          <Stat label="Donors" value={String(stats?.donorCount || 0)} />
          <Stat label="Campaigns" value={String(stats?.activeCampaigns || 0)} />
          <Stat label="People helped" value={String(stats?.beneficiaryCount || 0)} />
        </div>
        <Typography variant="h2" className="text-deep-green mb-4">SDG alignment</Typography>
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {sdg.length === 0 && <p className="text-charcoal/50">SDG tags will appear here once projects are tagged.</p>}
          {sdg.map((row: any) => (
            <div key={row.code} className="bg-white rounded-2xl p-5 border border-charcoal/5">
              <p className="text-xs font-bold uppercase text-goldenrod">SDG {row.code}</p>
              <p className="text-lg font-bold text-deep-green">{row.label || sdgLabel(row.code)}</p>
              <p className="text-sm text-charcoal/60">{row.projects} projects · {formatCurrency(row.raised)} raised</p>
            </div>
          ))}
        </div>
        <Link to="/campaigns" className="text-deep-green font-bold">Browse projects →</Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 text-center border border-charcoal/5">
      <p className="text-2xl font-bold text-deep-green">{value}</p>
      <p className="text-xs uppercase tracking-wider text-charcoal/50 mt-1">{label}</p>
    </div>
  );
}

export function ProjectMap({ lat, lng, label }: { lat?: number | null; lng?: number | null; label?: string }) {
  if (lat == null || lng == null || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null;
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-charcoal/5">
      <iframe title={label || 'Location'} src={osmEmbedUrl(Number(lat), Number(lng))} className="w-full h-64 border-0" />
      {label && (
        <p className="px-4 py-3 text-sm text-charcoal/70 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-deep-green" /> {label}
        </p>
      )}
    </div>
  );
}

export function ProjectUpdates({ updates }: { updates: any[] }) {
  if (!updates?.length) return null;
  return (
    <div className="space-y-4">
      <Typography variant="h3" className="text-deep-green">Progress updates</Typography>
      {updates.map((row) => (
        <div key={row.id} className="bg-white rounded-2xl p-5 border border-charcoal/5">
          <p className="font-bold">{row.title}</p>
          <p className="text-sm text-charcoal/60 mt-1">{row.body}</p>
          <p className="text-xs text-charcoal/40 mt-2">{new Date(row.created_at).toLocaleDateString()}</p>
          {Array.isArray(row.photo_urls) && row.photo_urls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {row.photo_urls.map((src: string) => (
                <img key={src} src={getImageUrl(src)} alt="" className="h-24 w-full object-cover rounded-xl" />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
