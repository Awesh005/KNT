import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { fetcher, api } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';

const TABS = ['Files', 'Letters', 'Templates', 'Seal'] as const;

export function Office() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Files');
  const [search, setSearch] = useState('');
  const { data: filesData, mutate: mutateFiles } = useSWR(`/office/files?search=${encodeURIComponent(search)}`, fetcher);
  const { data: lettersData, mutate: mutateLetters } = useSWR('/office/letters', fetcher);
  const { data: templatesData, mutate: mutateTemplates } = useSWR('/office/templates', fetcher);
  const { data: sendsData, mutate: mutateSends } = useSWR('/office/sends', fetcher);
  const { data: sealData, mutate: mutateSeal } = useSWR('/office/seal', fetcher);

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="!text-2xl text-deep-green mb-1">Office</Typography>
        <Typography variant="body" className="text-charcoal/60 text-sm">File registry, letter dispatch, digital seal, and QR verify codes.</Typography>
      </div>
      <div className="flex gap-2 flex-wrap">
        {TABS.map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${tab === item ? 'bg-deep-green text-white' : 'bg-white border border-charcoal/10 text-charcoal/60'}`}>
            {item}
          </button>
        ))}
      </div>
      {tab === 'Files' && <FilesTab data={filesData} mutate={mutateFiles} search={search} setSearch={setSearch} />}
      {tab === 'Letters' && <LettersTab letters={lettersData?.letters || []} templates={templatesData?.templates || []} sends={sendsData?.sends || []} mutate={mutateLetters} mutateSends={mutateSends} />}
      {tab === 'Templates' && <TemplatesTab templates={templatesData?.templates || []} mutate={mutateTemplates} />}
      {tab === 'Seal' && <SealTab sealUrl={sealData?.seal_url} mutate={mutateSeal} />}
    </div>
  );
}

function FilesTab({ data, mutate, search, setSearch }: any) {
  const [form, setForm] = useState({ title: '', folder: 'General', visibility: 'internal', allowed_roles: 'Admin,Super Admin,Employee', description: '' });
  const [file, setFile] = useState<File | null>(null);

  const upload = async () => {
    if (!file) return toast.error('Choose a file');
    const payload = new FormData();
    payload.append('file', file);
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    try {
      await api.post('/office/files', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('File registered');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-3xl border border-charcoal/5 p-5 space-y-2">
        <p className="font-bold">Register a file</p>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
        <select value={form.folder} onChange={(e) => setForm({ ...form, folder: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm">
          {(data?.folders || ['General', 'Policies', 'HR']).map((folder: string) => <option key={folder}>{folder}</option>)}
        </select>
        <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm">
          <option value="public">Public</option>
          <option value="internal">Internal (staff / members as set)</option>
          <option value="admin">Admin only</option>
        </select>
        <input placeholder="Allowed roles" value={form.allowed_roles} onChange={(e) => setForm({ ...form, allowed_roles: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Button onClick={upload}>Save to registry</Button>
      </div>
      <div className="lg:col-span-2 space-y-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files" className="w-full border rounded-xl px-3 py-2 text-sm" />
        {(data?.files || []).map((row: any) => (
          <div key={row.id} className="bg-white rounded-2xl border border-charcoal/5 p-4 flex justify-between gap-3">
            <div>
              <p className="font-bold">{row.title || row.original_name}</p>
              <p className="text-xs text-charcoal/50">{row.folder} · {row.visibility} {row.source === 'cms' ? '· policies CMS' : ''}</p>
            </div>
            <div className="flex gap-2 items-center">
              <a className="text-xs font-bold text-deep-green" href={getImageUrl(row.url)} target="_blank" rel="noreferrer">Open</a>
              {!String(row.id).startsWith('policy-') && (
                <button className="text-xs font-bold text-red-600" onClick={async () => { await api.delete(`/office/files/${row.id}`); mutate(); }}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LettersTab({ letters, templates, sends, mutate, mutateSends }: any) {
  const [form, setForm] = useState({ template_id: '', addressee_name: '', addressee_email: '', addressee_phone: '', subject: '', body: '' });

  const applyTemplate = (id: string) => {
    const template = templates.find((row: any) => String(row.id) === id);
    setForm({
      ...form,
      template_id: id,
      subject: template?.subject || form.subject,
      body: template?.body || form.body,
    });
  };

  const dispatch = async () => {
    try {
      const res = await api.post('/office/letters', { ...form, template_id: form.template_id || null });
      toast.success(`Dispatched ${res.data?.data?.letter?.letter_no}`);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Dispatch failed');
    }
  };

  const send = async (id: string, channel: 'email' | 'whatsapp') => {
    try {
      const res = await api.post(`/office/letters/${id}/send`, { channel });
      toast.success(channel === 'email' ? 'Email sent' : 'WhatsApp link ready');
      if (res.data?.data?.whatsappUrl) window.open(res.data.data.whatsappUrl, '_blank');
      mutateSends();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Send failed');
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-3xl border border-charcoal/5 p-5 space-y-2">
        <p className="font-bold">Dispatch letter</p>
        <select value={form.template_id} onChange={(e) => applyTemplate(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm">
          <option value="">Template</option>
          {templates.map((row: any) => <option key={row.id} value={row.id}>{row.name}</option>)}
        </select>
        <input placeholder="Addressee name" value={form.addressee_name} onChange={(e) => setForm({ ...form, addressee_name: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
        <input placeholder="Email" value={form.addressee_email} onChange={(e) => setForm({ ...form, addressee_email: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
        <input placeholder="Phone (WhatsApp)" value={form.addressee_phone} onChange={(e) => setForm({ ...form, addressee_phone: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
        <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
        <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm min-h-[140px]" />
        <Button onClick={dispatch}>Generate PDF + QR</Button>
      </div>
      <div className="lg:col-span-2 space-y-3">
        {letters.map((row: any) => (
          <div key={row.id} className="bg-white rounded-2xl border border-charcoal/5 p-4">
            <p className="font-bold">{row.letter_no} · {row.subject}</p>
            <p className="text-sm text-charcoal/50">{row.addressee_name} · verify {row.verify_code}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              {row.pdf_url && <a className="text-xs font-bold text-deep-green" href={getImageUrl(row.pdf_url)} target="_blank" rel="noreferrer">PDF</a>}
              <button className="text-xs font-bold text-deep-green" onClick={() => send(row.id, 'email')}>Email</button>
              <button className="text-xs font-bold text-deep-green" onClick={() => send(row.id, 'whatsapp')}>WhatsApp log</button>
            </div>
          </div>
        ))}
        <div className="bg-fog-gray rounded-2xl p-4">
          <p className="font-bold text-sm mb-2">Send log</p>
          {sends.map((row: any) => (
            <p key={row.id} className="text-xs text-charcoal/60">{row.channel} · {row.recipient} · {row.status} · {row.letter_no}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplatesTab({ templates, mutate }: any) {
  const [form, setForm] = useState({ name: '', subject: '', body: '' });
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl border border-charcoal/5 p-5 space-y-2">
        <p className="font-bold">New template</p>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
        <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
        <textarea placeholder="Body. Use {{name}}" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm min-h-[120px]" />
        <Button onClick={async () => { await api.post('/office/templates', form); toast.success('Saved'); mutate(); }}>Save template</Button>
      </div>
      <div className="space-y-3">
        {templates.map((row: any) => (
          <div key={row.id} className="bg-white rounded-2xl border border-charcoal/5 p-4">
            <p className="font-bold">{row.name}</p>
            <p className="text-sm text-charcoal/50">{row.subject}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SealTab({ sealUrl, mutate }: any) {
  return (
    <div className="bg-white rounded-3xl border border-charcoal/5 p-6 max-w-lg space-y-4">
      <p className="font-bold">Digital seal</p>
      <p className="text-sm text-charcoal/60">This image is stamped on dispatched letter PDFs. Logo is used until you upload a seal.</p>
      {sealUrl && <img src={getImageUrl(sealUrl)} alt="Seal" className="w-28 h-28 object-contain" />}
      <input type="file" accept="image/*" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const payload = new FormData();
        payload.append('seal', file);
        await api.post('/office/seal', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Seal updated');
        mutate();
      }} />
    </div>
  );
}
