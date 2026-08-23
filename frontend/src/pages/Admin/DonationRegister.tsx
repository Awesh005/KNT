import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { fetcher, api } from '@/lib/fetcher';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getImageUrl } from '@/utils/getImageUrl';

export function DonationRegister() {
  const [from, setFrom] = useState(`${new Date().getFullYear()}-04-01`);
  const [to, setTo] = useState(`${new Date().getFullYear() + 1}-03-31`);
  const { data, isLoading } = useSWR(`/finance/register?from=${from}&to=${to}&status=verified`, fetcher);
  const donations = data?.donations || [];

  const total = donations.reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">Donation register</Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Date, mode, campaign, PAN, receipt no, and 80G for the selected period.
          </Typography>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const res = await api.get(`/finance/register.csv?from=${from}&to=${to}`, { responseType: 'blob' });
                const url = URL.createObjectURL(res.data);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'donation-register.csv';
                a.click();
                URL.revokeObjectURL(url);
              } catch {
                toast.error('Could not export register');
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" /> Print</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/5 p-4 flex flex-wrap gap-3 print:hidden">
        <label className="text-sm">From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="ml-2 border border-charcoal/15 rounded-lg px-2 py-1" /></label>
        <label className="text-sm">To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="ml-2 border border-charcoal/15 rounded-lg px-2 py-1" /></label>
        <p className="text-sm font-bold text-deep-green self-center">Total {formatCurrency(total)}</p>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[11px] uppercase text-charcoal/50">
              <tr>
                <th className="px-3 py-3 text-left">Date</th>
                <th className="px-3 py-3 text-left">Donor</th>
                <th className="px-3 py-3 text-left">PAN</th>
                <th className="px-3 py-3 text-left">Campaign</th>
                <th className="px-3 py-3 text-left">Mode</th>
                <th className="px-3 py-3 text-left">Amount</th>
                <th className="px-3 py-3 text-left">Receipt</th>
                <th className="px-3 py-3 text-left">80G</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-charcoal/40">Loading register...</td></tr>
              ) : donations.map((row: any) => (
                <tr key={row.id}>
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(row.donated_at)}</td>
                  <td className="px-3 py-2">{row.donor_name}<div className="text-xs text-charcoal/40">{row.donor_email}</div></td>
                  <td className="px-3 py-2 font-mono text-xs">{row.guest_pan || '—'}</td>
                  <td className="px-3 py-2">{row.campaign_title || 'General'}</td>
                  <td className="px-3 py-2">{row.payment_mode || 'UPI'}</td>
                  <td className="px-3 py-2 font-bold">{formatCurrency(row.amount)}</td>
                  <td className="px-3 py-2">
                    {row.receipt_url ? <a href={getImageUrl(row.receipt_url)} target="_blank" rel="noreferrer" className="text-deep-green text-xs font-bold">{row.receipt_no}</a> : '—'}
                  </td>
                  <td className="px-3 py-2">
                    {row.certificate_url ? <a href={getImageUrl(row.certificate_url)} target="_blank" rel="noreferrer" className="text-deep-green text-xs font-bold">{row.certificate_no}</a> : '—'}
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
