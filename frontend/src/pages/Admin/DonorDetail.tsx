import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Download, Mail, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { fetcher, api } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';
import { formatCurrency, formatDate } from '@/utils/formatters';

export function DonorDetail() {
  const { key = '' } = useParams();
  const donorKey = decodeURIComponent(key);
  const { data, mutate, isLoading } = useSWR(key ? `/donors/${encodeURIComponent(donorKey)}` : null, fetcher);
  const donor = data?.donor;
  const [note, setNote] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [fy, setFy] = useState(() => {
    const now = new Date();
    const start = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (donor?.tags) setTagInput((donor.tags || []).join(', '));
  }, [donor]);

  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      await api.post(`/donors/${encodeURIComponent(donorKey)}/notes`, { note, follow_up_at: followUp || null });
      setNote('');
      setFollowUp('');
      toast.success('Note saved');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not save note');
    }
  };

  const handleSaveTags = async () => {
    const tags = tagInput.split(',').map((item) => item.trim()).filter(Boolean);
    try {
      await api.put(`/donors/${encodeURIComponent(donorKey)}/tags`, { tags });
      toast.success('Tags updated');
      mutate();
    } catch {
      toast.error('Could not update tags');
    }
  };

  const handleStatement = async (email = false) => {
    setBusy(true);
    try {
      const res = await api.post(`/donors/${encodeURIComponent(donorKey)}/statements`, { fy, email });
      toast.success(email ? 'Statement emailed' : 'Statement generated');
      if (res.data?.data?.pdf_url) window.open(getImageUrl(res.data.data.pdf_url), '_blank');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not generate statement');
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <p className="text-charcoal/50">Loading donor...</p>;
  if (!donor) return <p className="text-charcoal/50">Donor not found.</p>;

  return (
    <div className="space-y-6">
      <Link to="/admin/donors" className="inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-deep-green">
        <ArrowLeft className="w-4 h-4" /> Back to donors
      </Link>

      <div className="bg-white rounded-3xl border border-charcoal/5 p-6">
        <Typography variant="h2" className="!text-2xl text-deep-green mb-1">{donor.name}</Typography>
        <p className="text-sm text-charcoal/60">{donor.email} {donor.phone ? `· ${donor.phone}` : ''}</p>
        <div className="grid sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-fog-gray rounded-2xl p-4"><p className="text-xs text-charcoal/50">Lifetime</p><p className="text-xl font-bold text-deep-green">{formatCurrency(donor.totalGiven)}</p></div>
          <div className="bg-fog-gray rounded-2xl p-4"><p className="text-xs text-charcoal/50">Gifts</p><p className="text-xl font-bold">{donor.giftCount}</p></div>
          <div className="bg-fog-gray rounded-2xl p-4"><p className="text-xs text-charcoal/50">PAN</p><p className="font-mono">{donor.pan || '—'}</p></div>
          <div className="bg-fog-gray rounded-2xl p-4"><p className="text-xs text-charcoal/50">80G</p><p className="font-bold">{donor.has80G ? 'Issued' : 'Not issued'}</p></div>
        </div>
        <p className="text-sm text-charcoal/60 mt-4">
          {[donor.address, donor.city, donor.state, donor.pincode].filter(Boolean).join(', ') || 'No address on file'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-charcoal/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-charcoal/5 font-bold">Gift history</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase text-charcoal/50">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Campaign</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Docs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {(donor.gifts || []).map((gift: any) => (
                  <tr key={gift.id}>
                    <td className="px-4 py-3">{formatDate(gift.donated_at)}</td>
                    <td className="px-4 py-3">{gift.campaign_title || 'General'}</td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(gift.amount)}</td>
                    <td className="px-4 py-3 space-x-2">
                      {gift.receipt_url && <a className="text-deep-green text-xs font-bold" href={getImageUrl(gift.receipt_url)} target="_blank" rel="noreferrer">Receipt</a>}
                      {gift.certificate_url && <a className="text-deep-green text-xs font-bold" href={getImageUrl(gift.certificate_url)} target="_blank" rel="noreferrer">80G</a>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-charcoal/5 p-5 space-y-3">
            <p className="font-bold">Tags</p>
            <div className="flex flex-wrap gap-1">
              {(donor.tags || []).map((item: string) => (
                <span key={item} className="text-[10px] uppercase bg-light-green text-deep-green px-2 py-1 rounded-full">{item}</span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="csr, major, follow-up"
              className="w-full px-3 py-2 rounded-xl border border-charcoal/15 text-sm"
            />
            <Button size="sm" variant="outline" onClick={handleSaveTags}>Save tags</Button>
          </div>

          <div className="bg-white rounded-3xl border border-charcoal/5 p-5 space-y-3">
            <p className="font-bold">Staff notes / follow-up</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full min-h-[90px] px-3 py-2 rounded-xl border border-charcoal/15 text-sm" placeholder="Call after 80G issued..." />
            <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-charcoal/15 text-sm" />
            <Button size="sm" onClick={handleAddNote}><Plus className="w-4 h-4 mr-1" /> Add note</Button>
            <div className="space-y-3 pt-2">
              {(donor.notes || []).map((item: any) => (
                <div key={item.id} className="text-sm border-t border-charcoal/5 pt-3">
                  <p>{item.note}</p>
                  <p className="text-xs text-charcoal/40 mt-1">
                    {item.author_name || 'Staff'} · {formatDate(item.created_at)}
                    {item.follow_up_at ? ` · follow up ${formatDate(item.follow_up_at)}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-charcoal/5 p-5 space-y-3">
            <p className="font-bold">Annual statement</p>
            <input value={fy} onChange={(e) => setFy(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-charcoal/15 text-sm" placeholder="2025-26" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" isLoading={busy} onClick={() => handleStatement(false)}>
                <Download className="w-4 h-4 mr-1" /> PDF
              </Button>
              <Button size="sm" isLoading={busy} onClick={() => handleStatement(true)}>
                <Mail className="w-4 h-4 mr-1" /> Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
