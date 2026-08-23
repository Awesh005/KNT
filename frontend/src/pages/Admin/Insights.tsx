import { useState } from 'react';
import { Link } from 'react-router';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { fetcher } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';
import { formatCurrency } from '@/utils/formatters';
import { sdgLabel } from '@/constants/sdg';

const TABS = ['Financial', 'Beneficiary', 'Volunteer', 'CSR', 'SDG'] as const;

export function Insights() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Financial');
  const { data: finance } = useSWR('/finance/dashboard', fetcher);
  const { data: overview } = useSWR('/impact/overview', fetcher);
  const { data: volunteersData } = useSWR('/people/volunteers', fetcher);
  const volunteers = volunteersData?.volunteers || [];
  const beneficiaries = overview?.beneficiaries || [];
  const csr = overview?.csr || [];
  const sdg = overview?.sdg || [];

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="!text-2xl text-deep-green mb-1">Insights</Typography>
        <Typography variant="body" className="text-charcoal/60 text-sm">Financial, people, volunteer, CSR, and SDG dashboards.</Typography>
      </div>
      <div className="flex gap-2 flex-wrap">
        {TABS.map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${tab === item ? 'bg-deep-green text-white' : 'bg-white border border-charcoal/10 text-charcoal/60'}`}>
            {item}
          </button>
        ))}
      </div>

      {tab === 'Financial' && (
        <div className="grid md:grid-cols-4 gap-4">
          <InsightCard label="Income (FY)" value={formatCurrency(finance?.income || 0)} />
          <InsightCard label="Spent" value={formatCurrency(finance?.spent || 0)} />
          <InsightCard label="Remaining" value={formatCurrency(finance?.remaining || 0)} />
          <InsightCard label="Utilization" value={`${finance?.utilizationPct || 0}%`} />
          <div className="md:col-span-4 bg-white rounded-2xl border border-charcoal/5 p-5">
            <p className="text-xs font-bold uppercase text-charcoal/40 mb-3">Monthly verified donations</p>
            <div className="flex items-end gap-2 h-40">
              {(finance?.monthly || []).map((row: any) => {
                const max = Math.max(...(finance.monthly || []).map((item: any) => item.total), 1);
                return (
                  <div key={row.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-deep-green/80 rounded-t-md" style={{ height: `${Math.max(8, (row.total / max) * 100)}%` }} />
                    <span className="text-[10px] text-charcoal/40">{String(row.month).slice(5)}</span>
                  </div>
                );
              })}
              {(!finance?.monthly || finance.monthly.length === 0) && <p className="text-sm text-charcoal/50">No monthly data yet.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'Beneficiary' && (
        <div className="bg-white rounded-2xl border border-charcoal/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-charcoal/50">
              <tr>
                <th className="px-4 py-3 text-left">Person</th>
                <th className="px-4 py-3 text-left">Kind</th>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Project</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {beneficiaries.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-charcoal/50">No beneficiaries yet. Open a campaign dashboard to add people.</td></tr>}
              {beneficiaries.map((row: any) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 flex items-center gap-3">
                    {row.photo_url ? <img src={getImageUrl(row.photo_url)} alt="" className="w-8 h-8 rounded-lg object-cover" /> : null}
                    {row.name}
                  </td>
                  <td className="px-4 py-3 capitalize">{row.kind}</td>
                  <td className="px-4 py-3">{row.city || '—'}</td>
                  <td className="px-4 py-3">
                    {row.campaign_id ? <Link to={`/admin/campaigns/${row.campaign_id}/manage`} className="text-deep-green font-bold">{row.campaign_title || 'Open project'}</Link> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Volunteer' && (
        <div className="grid md:grid-cols-3 gap-4">
          <InsightCard label="Total volunteers" value={String(volunteers.length)} />
          <InsightCard label="Active" value={String(volunteers.filter((row: any) => row.status === 'active').length)} />
          <InsightCard label="Pending" value={String(volunteers.filter((row: any) => row.status === 'pending').length)} />
          <div className="md:col-span-3 bg-white rounded-2xl border border-charcoal/5 p-4 space-y-2">
            {volunteers.slice(0, 20).map((row: any) => (
              <div key={row.id} className="flex justify-between text-sm border-b border-charcoal/5 py-2">
                <span className="font-bold">{row.name || row.full_name}</span>
                <span className="text-charcoal/50 capitalize">{row.status} · {row.city || row.phone || ''}</span>
              </div>
            ))}
            {volunteers.length === 0 && <p className="text-sm text-charcoal/50">No volunteer applications yet. Volunteer portal is at /portal after approval.</p>}
          </div>
        </div>
      )}

      {tab === 'CSR' && (
        <div className="bg-white rounded-2xl border border-charcoal/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-charcoal/50">
              <tr>
                <th className="px-4 py-3 text-left">Donor</th>
                <th className="px-4 py-3 text-left">Given</th>
                <th className="px-4 py-3 text-left">Gifts</th>
                <th className="px-4 py-3 text-left">Projects supported</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {csr.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-charcoal/50">No verified donations yet.</td></tr>}
              {csr.map((row: any) => (
                <tr key={row.donor_key}>
                  <td className="px-4 py-3 font-bold">{row.name || 'Anonymous'}</td>
                  <td className="px-4 py-3 text-deep-green font-bold">{formatCurrency(row.given)}</td>
                  <td className="px-4 py-3">{row.gifts}</td>
                  <td className="px-4 py-3 text-charcoal/60">{row.campaigns || 'General fund'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'SDG' && (
        <div className="grid md:grid-cols-2 gap-4">
          {sdg.length === 0 && <p className="text-sm text-charcoal/50">Tag campaigns with SDGs on the project dossier to populate this dashboard.</p>}
          {sdg.map((row: any) => (
            <div key={row.code} className="bg-white rounded-2xl border border-charcoal/5 p-5">
              <p className="text-xs font-bold uppercase text-goldenrod">SDG {row.code}</p>
              <Typography variant="h3" className="text-deep-green">{row.label || sdgLabel(row.code)}</Typography>
              <p className="text-sm text-charcoal/60 mt-2">{row.projects} projects · {formatCurrency(row.raised)} raised</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-charcoal/5 p-5">
      <p className="text-xs font-bold uppercase text-charcoal/40 mb-1">{label}</p>
      <p className="text-2xl font-bold text-deep-green">{value}</p>
    </div>
  );
}
