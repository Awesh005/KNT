import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Download, Search, Users } from 'lucide-react';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { fetcher, api } from '@/lib/fetcher';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '@/utils/formatters';

type DonorRow = {
  donorKey: string;
  name: string;
  email: string;
  phone?: string;
  pan?: string;
  city?: string;
  giftCount: number;
  totalGiven: number;
  lastGiftAt: string;
  has80G: boolean;
  tags: string[];
};

export function Donors() {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const query = new URLSearchParams();
  if (search.trim()) query.set('search', search.trim());
  if (tag.trim()) query.set('tag', tag.trim());
  const { data, isLoading } = useSWR(`/donors?${query.toString()}`, fetcher);
  const donors: DonorRow[] = data?.donors || [];

  const allTags = useMemo(() => {
    const set = new Set<string>();
    donors.forEach((donor) => (donor.tags || []).forEach((item) => set.add(item)));
    return [...set];
  }, [donors]);

  const handleExport = async () => {
    try {
      const params = query.toString();
      const res = await api.get(`/donors/export.csv${params ? `?${params}` : ''}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'knt-donors.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export donors');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">Donor CRM</Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Search donors, last gift, lifetime giving, 80G status, and tags.
          </Typography>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const fy = new Date().getMonth() >= 3
                  ? `${new Date().getFullYear()}-${String((new Date().getFullYear() + 1) % 100).padStart(2, '0')}`
                  : `${new Date().getFullYear() - 1}-${String(new Date().getFullYear() % 100).padStart(2, '0')}`;
                await api.post('/donors/statements/bulk', { fy, email: true });
                toast.success('Annual statements queued for email');
              } catch {
                toast.error('Could not send annual statements');
              }
            }}
          >
            Email FY statements
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/5 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-charcoal/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, PAN, phone"
            className="flex-1 outline-none text-sm"
          />
        </div>
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Filter tag"
          list="donor-tags"
          className="sm:w-48 px-3 py-2 rounded-xl border border-charcoal/15 text-sm"
        />
        <datalist id="donor-tags">
          {allTags.map((item) => <option key={item} value={item} />)}
        </datalist>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-charcoal/50">
              <tr>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">PAN</th>
                <th className="px-4 py-3">Gifts</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Last gift</th>
                <th className="px-4 py-3">80G</th>
                <th className="px-4 py-3">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-charcoal/40">Loading donors...</td></tr>
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-charcoal/40">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No donors found.
                  </td>
                </tr>
              ) : donors.map((donor) => (
                <tr key={donor.donorKey} className="hover:bg-fog-gray/60">
                  <td className="px-4 py-3">
                    <Link to={`/admin/donors/${encodeURIComponent(donor.donorKey)}`} className="font-bold text-deep-green hover:underline">
                      {donor.name || 'Unnamed'}
                    </Link>
                    <p className="text-xs text-charcoal/50">{donor.email}</p>
                    {donor.city && <p className="text-xs text-charcoal/40">{donor.city}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{donor.pan || '—'}</td>
                  <td className="px-4 py-3">{donor.giftCount}</td>
                  <td className="px-4 py-3 font-bold text-deep-green">{formatCurrency(donor.totalGiven)}</td>
                  <td className="px-4 py-3 text-charcoal/60">{donor.lastGiftAt ? formatDate(donor.lastGiftAt) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${donor.has80G ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-charcoal/50'}`}>
                      {donor.has80G ? 'Issued' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(donor.tags || []).map((item) => (
                        <span key={item} className="text-[10px] uppercase tracking-wide bg-light-green text-deep-green px-2 py-1 rounded-full">{item}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
