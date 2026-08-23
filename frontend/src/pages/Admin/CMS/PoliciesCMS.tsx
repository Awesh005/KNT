import { useMemo, useState } from 'react';
import { Plus, Trash2, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { fetcher, api } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';
import { POLICY_TYPES, type PolicyDoc, type PolicyType } from '@/types/policy.types';

const emptyForm: {
  type: PolicyType;
  title: string;
  year: string;
  fileUrl: string;
  visibility: 'public' | 'internal';
} = {
  type: POLICY_TYPES[0],
  title: '',
  year: String(new Date().getFullYear()),
  fileUrl: '',
  visibility: 'public',
};

export function PoliciesCMS() {
  const { data, mutate } = useSWR('/cms/global/policies', fetcher);
  const documents: PolicyDoc[] = Array.isArray(data?.content) ? data.content : [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [isUploading, setIsUploading] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(
    () => (filter === 'all' ? documents : documents.filter((doc) => doc.type === filter)),
    [documents, filter]
  );

  const saveDocuments = async (next: PolicyDoc[], message: string) => {
    try {
      mutate({ content: next }, false);
      await api.put('/cms/global/policies', { content: next });
      toast.success(message);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save documents');
      mutate();
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const upload = new FormData();
    upload.append('document', file);
    try {
      setIsUploading(true);
      const res = await api.post('/cms/upload/policy', upload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData({ ...formData, fileUrl: res.data.data.fileUrl, title: formData.title || file.name.replace(/\.[^.]+$/, '') });
      toast.success('File uploaded');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed. Use PDF, JPG, or PNG.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.fileUrl) {
      toast.error('Title and file are required');
      return;
    }
    const next = [
      {
        id: Date.now(),
        ...formData,
        updatedAt: new Date().toISOString(),
      },
      ...documents,
    ];
    saveDocuments(next, 'Document added');
    setIsModalOpen(false);
    setFormData(emptyForm);
  };

  const handleDelete = async (doc: PolicyDoc) => {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    if (doc.fileUrl.startsWith('/uploads/policies/')) {
      try {
        await api.delete('/cms/upload/policy', { data: { fileUrl: doc.fileUrl } });
      } catch {
        // continue even if file already missing
      }
    }
    saveDocuments(documents.filter((item) => item.id !== doc.id), 'Document deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Documents & Policies
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Upload annual reports, board resolutions, and statutory policies. Public files appear on /policies.
          </Typography>
        </div>
        <Button onClick={() => { setFormData(emptyForm); setIsModalOpen(true); }} className="bg-goldenrod hover:bg-yellow-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Document
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold ${filter === 'all' ? 'bg-deep-green text-white' : 'bg-white border border-charcoal/10 text-charcoal/60'}`}
        >
          All ({documents.length})
        </button>
        {POLICY_TYPES.map((type) => {
          const count = documents.filter((doc) => doc.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${filter === type ? 'bg-deep-green text-white' : 'bg-white border border-charcoal/10 text-charcoal/60'}`}
            >
              {type}{count ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/5 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-charcoal/50">
            <tr>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-charcoal/40">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-charcoal/20" />
                  No documents in this category yet.
                </td>
              </tr>
            ) : (
              filtered.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-4 py-3 font-bold text-charcoal">{doc.title}</td>
                  <td className="px-4 py-3 text-charcoal/60">{doc.type}</td>
                  <td className="px-4 py-3">{doc.year || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={doc.visibility === 'public' ? 'text-green-700 text-xs font-bold' : 'text-charcoal/40 text-xs font-bold'}>
                      {doc.visibility === 'public' ? 'Public' : 'Internal'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => window.open(getImageUrl(doc.fileUrl), '_blank')} className="p-2 text-charcoal/50 hover:text-deep-green">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(doc)} className="p-2 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4">
            <Typography variant="h3">Add document</Typography>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PolicyType })}
              className="w-full p-3 border border-charcoal/10 rounded-xl"
            >
              {POLICY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Title"
              className="w-full p-3 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green"
            />
            <input
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="Year"
              className="w-full p-3 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green"
            />
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'public' | 'internal' })}
              className="w-full p-3 border border-charcoal/10 rounded-xl"
            >
              <option value="public">Public — show on website</option>
              <option value="internal">Internal — admin only</option>
            </select>
            <input type="file" accept=".pdf,image/*" onChange={handleUpload} disabled={isUploading} />
            {formData.fileUrl && <p className="text-xs text-green-700">File ready: {formData.fileUrl.split('/').pop()}</p>}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isUploading}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
