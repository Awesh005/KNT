import { useMemo, useState } from 'react';
import { Download, FileBadge, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { fetcher, api } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';
import { formatCurrency, formatDate } from '@/utils/formatters';

type DonationRow = {
  id: string;
  donorName?: string;
  donorEmail?: string;
  campaignTitle?: string;
  amount: number;
  status: string;
  guestPan?: string;
  certificateUrl?: string;
  certificateNo?: string;
  donatedAt: string;
};

export function EightyGCertificates() {
  const { data, mutate, isLoading } = useSWR('/donations?status=verified&limit=200', fetcher);
  const donations: DonationRow[] = data?.donations || [];
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return donations.filter((donation) => {
      if (!term) return true;
      return [donation.donorName, donation.donorEmail, donation.guestPan, donation.id, donation.campaignTitle]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [donations, search]);

  const issuedCount = donations.filter((donation) => donation.certificateUrl).length;

  const handleGenerate = async (donationId: string, regenerate = false) => {
    setBusyId(donationId);
    try {
      const url = regenerate
        ? `/documents/certificates/${donationId}?regenerate=true`
        : `/documents/certificates/${donationId}`;
      await api.post(url);
      toast.success(regenerate ? '80G certificate regenerated' : '80G certificate generated');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not generate 80G certificate');
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = (url?: string) => {
    if (!url) return;
    window.open(getImageUrl(url), '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            80G Certificates
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Generate and download tax certificates for verified donations. Certificates auto-issue when PAN is captured.
          </Typography>
        </div>
        <div className="text-sm text-charcoal/60">
          {issuedCount} issued / {donations.length} verified donations
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/5 overflow-hidden">
        <div className="p-4 border-b border-charcoal/5 flex items-center gap-3">
          <Search className="w-4 h-4 text-charcoal/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor, PAN, email, or donation ID"
            className="flex-1 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-charcoal/50">
              <tr>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">PAN</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Certificate</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-charcoal/40">Loading certificates...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-charcoal/40">No verified donations found.</td>
                </tr>
              ) : (
                rows.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-charcoal">{donation.donorName || 'Anonymous'}</p>
                      <p className="text-xs text-charcoal/50">{donation.donorEmail || donation.campaignTitle || donation.id}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{donation.guestPan || '—'}</td>
                    <td className="px-4 py-3 font-bold text-deep-green">{formatCurrency(donation.amount)}</td>
                    <td className="px-4 py-3 text-charcoal/60">{formatDate(donation.donatedAt)}</td>
                    <td className="px-4 py-3">
                      {donation.certificateUrl ? (
                        <span className="text-green-700 text-xs font-bold">{donation.certificateNo || 'Issued'}</span>
                      ) : (
                        <span className="text-charcoal/40 text-xs">Not issued</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {donation.certificateUrl ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownload(donation.certificateUrl)}>
                            <Download className="w-4 h-4 mr-1" /> Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerate(donation.id, true)}
                            isLoading={busyId === donation.id}
                          >
                            Regenerate
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleGenerate(donation.id)}
                          isLoading={busyId === donation.id}
                        >
                          {!busyId && <FileBadge className="w-4 h-4 mr-1" />}
                          Generate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
