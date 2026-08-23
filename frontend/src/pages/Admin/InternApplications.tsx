import { useState } from 'react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { GraduationCap, Calendar, Mail, Phone, ChevronDown, Trash2, Download } from 'lucide-react';
import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';
import toast from 'react-hot-toast';
import { resolveInternships } from '@/data/csrInternships';

interface InternApplication {
  id: number;
  internship_id: string;
  internship_title: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  year: string | null;
  duration: string | null;
  message: string | null;
  resume_url: string | null;
  status: 'new' | 'reviewing' | 'shortlisted' | 'selected' | 'rejected';
  created_at: string;
}

export function InternApplications() {
  const [filter, setFilter] = useState('all');
  const { data, mutate } = useSWR('/intern-applications', fetcher);
  const applications: InternApplication[] = data?.applications || [];
  const filtered = applications.filter((app) => (filter === 'all' ? true : app.status === filter));

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.patch(`/intern-applications/${id}/status`, { status });
      toast.success('Status updated');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this internship application?')) return;
    try {
      await api.delete(`/intern-applications/${id}`);
      toast.success('Application deleted');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'reviewing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'shortlisted': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'selected': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">Internship Applications</Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            College internship applications from the CSR page. Job hiring stays under Job Applications.
          </Typography>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-charcoal/20 bg-white text-sm font-medium"
        >
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="reviewing">Reviewing</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <AddInternApplicationForm onCreated={() => mutate()} />

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-charcoal/10 p-12 text-center">
          <GraduationCap className="w-12 h-12 text-charcoal/20 mx-auto mb-4" />
          <Typography variant="h3" className="mb-2">No internship applications</Typography>
          <p className="text-charcoal/50">Add a walk-in student above, or wait for submissions from /csr.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((application) => (
            <div key={application.id} className="bg-white rounded-3xl border border-charcoal/10 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="font-bold text-lg text-charcoal">{application.name}</h3>
                    <span className="text-sm text-deep-green font-semibold bg-deep-green/10 px-3 py-1 rounded-full">
                      {application.internship_title}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-charcoal/70 mb-4">
                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{application.email}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{application.phone}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(application.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-charcoal/80 mb-1"><strong>College:</strong> {application.college}</p>
                  <p className="text-sm text-charcoal/80 mb-1"><strong>Course:</strong> {application.course}{application.year ? ` · ${application.year}` : ''}</p>
                  {application.duration && <p className="text-sm text-charcoal/80 mb-2"><strong>Duration:</strong> {application.duration}</p>}
                  {application.message && <p className="text-sm text-charcoal/70 mb-4 whitespace-pre-wrap">{application.message}</p>}
                  {application.resume_url && (
                    <a
                      href={getImageUrl(application.resume_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-lg bg-light-green text-deep-green hover:bg-deep-green hover:text-white transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Resume
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <select
                      value={application.status}
                      onChange={(e) => handleStatusChange(application.id, e.target.value)}
                      className={`text-sm rounded-full px-3 py-1 border outline-none font-medium appearance-none pr-8 ${getStatusColor(application.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="selected">Selected</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                  </div>
                  <button onClick={() => handleDelete(application.id)} className="p-2 rounded-xl text-red-500 hover:bg-red-50" title="Delete">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddInternApplicationForm({ onCreated }: { onCreated: () => void }) {
  const { data } = useSWR('/cms/global/csr_internships', fetcher);
  const internships = resolveInternships(data?.content);
  const [form, setForm] = useState({
    internship_id: '',
    internship_title: '',
    name: '',
    email: '',
    phone: '',
    college: '',
    course: '',
    year: '',
    duration: '',
    message: '',
  });
  const [resume, setResume] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.college.trim() || !form.course.trim()) {
      toast.error('Name, email, phone, college, and course are required');
      return;
    }
    const selected = internships.find((item) => item.id === form.internship_id);
    const title = selected?.title || form.internship_title.trim();
    if (!title) {
      toast.error('Select an internship or enter a title');
      return;
    }
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('internship_id', selected?.id || `walk-in-${Date.now()}`);
      payload.append('internship_title', title);
      payload.append('name', form.name.trim());
      payload.append('email', form.email.trim());
      payload.append('phone', form.phone.trim());
      payload.append('college', form.college.trim());
      payload.append('course', form.course.trim());
      payload.append('year', form.year.trim());
      payload.append('duration', form.duration.trim() || selected?.duration || '');
      payload.append('message', form.message.trim());
      if (resume) payload.append('resume', resume);
      await api.post('/intern-applications/admin', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Internship application added');
      setForm({ internship_id: '', internship_title: '', name: '', email: '', phone: '', college: '', course: '', year: '', duration: '', message: '' });
      setResume(null);
      onCreated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not add application');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-charcoal/5 space-y-3">
      <div>
        <p className="font-bold text-charcoal">Add walk-in internship application</p>
        <p className="text-xs text-charcoal/50 mt-0.5">For students who apply in person. Resume is optional.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <select
          value={form.internship_id}
          onChange={(e) => setForm({ ...form, internship_id: e.target.value, internship_title: e.target.value ? '' : form.internship_title })}
          className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm"
        >
          <option value="">Internship — or type title</option>
          {internships.map((item) => (
            <option key={item.id} value={item.id}>{item.title}</option>
          ))}
        </select>
        {!form.internship_id && (
          <input placeholder="Internship title" value={form.internship_title} onChange={(e) => setForm({ ...form, internship_title: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        )}
        <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        <input placeholder="College" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        <input placeholder="Course" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        <input placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
      </div>
      <textarea placeholder="Notes (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border border-charcoal/10 rounded-xl px-3 py-2 text-sm min-h-[72px]" />
      <label className="text-xs text-charcoal/60 border border-charcoal/10 rounded-xl px-3 py-2 cursor-pointer hover:border-deep-green/40 inline-block">
        Resume{resume ? `: ${resume.name}` : ' (optional)'}
        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setResume(e.target.files?.[0] || null)} />
      </label>
      <div>
        <Button size="sm" disabled={saving} onClick={submit}>{saving ? 'Adding…' : 'Add application'}</Button>
      </div>
    </div>
  );
}
