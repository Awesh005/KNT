import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { fetcher, api } from '@/lib/fetcher';

export function Comms() {
  const [tab, setTab] = useState<'Templates' | 'Log'>('Templates');
  const { data: templatesData, mutate } = useSWR('/comms/templates', fetcher);
  const { data: logData } = useSWR(tab === 'Log' ? '/comms/log' : null, fetcher);
  const templates = templatesData?.templates || [];
  const [editing, setEditing] = useState<any>(null);

  const save = async () => {
    try {
      await api.put(`/comms/templates/${editing.template_key}`, { subject: editing.subject, html: editing.html, name: editing.name });
      toast.success('Template saved');
      mutate();
      setEditing(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="!text-2xl text-deep-green mb-1">Communications</Typography>
        <Typography variant="body" className="text-charcoal/60 text-sm">Editable mail templates and send log. WhatsApp stays the floating widget.</Typography>
      </div>
      <div className="flex gap-2">
        {(['Templates', 'Log'] as const).map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${tab === item ? 'bg-deep-green text-white' : 'bg-white border border-charcoal/10 text-charcoal/60'}`}>{item}</button>
        ))}
      </div>
      {tab === 'Templates' && (
        <div className="space-y-3">
          {templates.map((row: any) => (
            <div key={row.template_key} className="bg-white rounded-2xl border border-charcoal/5 p-4 flex justify-between gap-3">
              <div>
                <p className="font-bold">{row.name}</p>
                <p className="text-xs text-charcoal/50">{row.template_key} · {row.subject}</p>
              </div>
              <Button size="sm" onClick={() => setEditing({ ...row })}>Edit</Button>
            </div>
          ))}
        </div>
      )}
      {tab === 'Log' && (
        <div className="bg-white rounded-2xl border border-charcoal/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-charcoal/50">
              <tr><th className="px-4 py-3 text-left">Time</th><th className="px-4 py-3 text-left">To</th><th className="px-4 py-3 text-left">Subject</th><th className="px-4 py-3 text-left">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {(logData?.log || []).map((row: any) => (
                <tr key={row.id}>
                  <td className="px-4 py-2">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{row.recipient}</td>
                  <td className="px-4 py-2">{row.subject}</td>
                  <td className="px-4 py-2 capitalize">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 bg-charcoal/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <Typography variant="h3">{editing.name}</Typography>
            <p className="text-xs text-charcoal/50">Use {'{{name}}'} placeholders. SMTP skip is logged if mail is not configured.</p>
            <input value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
            <textarea value={editing.html} onChange={(e) => setEditing({ ...editing, html: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm h-48" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
