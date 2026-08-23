import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, CheckCircle, XCircle, Save } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';
import { DEFAULT_CSR_PAGE, type CsrInternship, type CsrPageContent } from '@/data/csrInternships';

const emptyForm = {
  title: '',
  duration: '',
  seats: 4,
  eligibility: '',
  location: '',
  stipend: '',
  isActive: true,
};

export function CsrCMS() {
  const { data, mutate } = useSWR('/cms/global/csr_internships', fetcher);
  const internships: CsrInternship[] = Array.isArray(data?.content) ? data.content : [];
  const { data: pageData, mutate: mutatePage } = useSWR('/cms/global/csr_page', fetcher);

  const [searchTerm, setSearchTerm] = useState('');
  const [pageForm, setPageForm] = useState<CsrPageContent>(DEFAULT_CSR_PAGE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<CsrInternship | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (pageData?.content && Object.keys(pageData.content).length > 0) {
      setPageForm({ ...DEFAULT_CSR_PAGE, ...pageData.content });
    }
  }, [pageData]);

  const handlePageSave = async () => {
    try {
      mutatePage({ content: pageForm }, false);
      await api.put('/cms/global/csr_page', { content: pageForm });
      mutatePage();
      toast.success('CSR page text saved');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save CSR page');
      mutatePage();
    }
  };

  const saveInternships = async (next: CsrInternship[], message: string) => {
    try {
      mutate({ content: next }, false);
      await api.put('/cms/global/csr_internships', { content: next });
      toast.success(message);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update internships');
      mutate();
    }
  };

  const handleOpenModal = (item?: CsrInternship) => {
    if (item) {
      setEditing(item);
      setFormData({
        title: item.title,
        duration: item.duration,
        seats: item.seats,
        eligibility: item.eligibility,
        location: item.location,
        stipend: item.stipend,
        isActive: item.isActive,
      });
    } else {
      setEditing(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title) return;
    const next = [...internships];
    if (editing) {
      const index = next.findIndex((item) => item.id === editing.id);
      if (index !== -1) next[index] = { ...editing, ...formData };
      saveInternships(next, 'Internship updated');
    } else {
      next.push({ id: `csr-${Date.now()}`, ...formData });
      saveInternships(next, 'Internship added');
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    const next = internships.map((item) => (item.id === id ? { ...item, isActive: !currentStatus } : item));
    saveInternships(next, currentStatus ? 'Internship closed' : 'Internship opened');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this internship posting?')) return;
    saveInternships(internships.filter((item) => item.id !== id), 'Internship deleted');
  };

  const filtered = internships.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">CSR Internships CMS</Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Public page intro and college internship openings. Applications land in HR → Internships.
          </Typography>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-goldenrod hover:bg-yellow-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Internship
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-charcoal/5 pb-4">
          <Typography variant="h3" className="!text-lg text-deep-green">CSR page text</Typography>
          <Button onClick={handlePageSave} className="bg-goldenrod hover:bg-yellow-600 text-white py-2">
            <Save className="w-4 h-4 mr-2" /> Save Page
          </Button>
        </div>
        <div>
          <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Heading</label>
          <input value={pageForm.heading} onChange={(e) => setPageForm({ ...pageForm, heading: e.target.value })} className="w-full p-3 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
        </div>
        <div>
          <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Intro</label>
          <textarea value={pageForm.intro} onChange={(e) => setPageForm({ ...pageForm, intro: e.target.value })} className="w-full p-3 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green h-24 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-charcoal/70 uppercase mb-3">Highlights</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(pageForm.highlights || []).map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-charcoal/10 space-y-2">
                <input
                  value={item.title}
                  onChange={(e) => {
                    const highlights = [...pageForm.highlights];
                    highlights[idx] = { ...highlights[idx], title: e.target.value };
                    setPageForm({ ...pageForm, highlights });
                  }}
                  className="w-full p-2 border border-charcoal/10 rounded-md outline-none focus:border-deep-green text-sm font-bold"
                />
                <textarea
                  value={item.text}
                  onChange={(e) => {
                    const highlights = [...pageForm.highlights];
                    highlights[idx] = { ...highlights[idx], text: e.target.value };
                    setPageForm({ ...pageForm, highlights });
                  }}
                  className="w-full p-2 border border-charcoal/10 rounded-md outline-none focus:border-deep-green text-sm h-24 resize-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        <div className="p-4 border-b border-charcoal/5 flex bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input
              type="text"
              placeholder="Search internships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green outline-none text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-charcoal/60 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Internship</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Seats</th>
                <th className="px-6 py-4">Eligibility</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-charcoal">{item.title}</td>
                  <td className="px-6 py-4 text-charcoal/70">{item.duration}</td>
                  <td className="px-6 py-4 text-charcoal/70">{item.seats}</td>
                  <td className="px-6 py-4 text-charcoal/60 max-w-[220px] truncate" title={item.eligibility}>{item.eligibility}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.isActive ? 'Open' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleToggleStatus(item.id, item.isActive)} className={`p-1.5 rounded-lg ${item.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>
                        {item.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleOpenModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-charcoal/5 flex justify-between items-center">
              <Typography variant="h3">{editing ? 'Edit Internship' : 'Add Internship'}</Typography>
              <button onClick={() => setIsModalOpen(false)} className="text-charcoal/50 hover:text-charcoal"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Duration</label>
                    <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Seats</label>
                    <input type="number" value={formData.seats} onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Eligibility</label>
                  <textarea value={formData.eligibility} onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green h-20 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Location</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Stipend / Support</label>
                  <input type="text" value={formData.stipend} onChange={(e) => setFormData({ ...formData, stipend: e.target.value })} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="isActive" className="text-sm font-medium text-charcoal">Open for applications</label>
                </div>
              </div>
              <div className="p-6 border-t border-charcoal/5 bg-gray-50 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Internship</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
