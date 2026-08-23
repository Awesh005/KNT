import { useState } from 'react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Briefcase, Calendar, Mail, Phone, ChevronDown, Trash2, Download } from 'lucide-react';
import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';
import toast from 'react-hot-toast';

interface JobApplication {
  id: number;
  job_id: string;
  job_title: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string | null;
  documents: Record<string, string>;
  status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  created_at: string;
}

const DOC_LABELS: Record<string, string> = {
  photo: 'Photo',
  aadhaar: 'Aadhaar',
  pan: 'PAN',
  education: 'Education',
  resume: 'Resume',
  experienceDoc: 'Experience',
  caste: 'Caste Certificate',
  address: 'Address Proof',
};

export function JobApplications() {
  const [filter, setFilter] = useState('all');
  const { data, mutate } = useSWR('/job-applications', fetcher);
  const applications: JobApplication[] = data?.applications || [];

  const filtered = applications.filter((app) => (filter === 'all' ? true : app.status === filter));

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.patch(`/job-applications/${id}/status`, { status });
      toast.success('Status updated');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this application?')) return;
    try {
      await api.delete(`/job-applications/${id}`);
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
      case 'hired': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">Job Applications</Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Add walk-in applications here, or they will also appear from the public career form.
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
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <AddApplicationForm onCreated={() => mutate()} />

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-charcoal/10 p-12 text-center">
          <Briefcase className="w-12 h-12 text-charcoal/20 mx-auto mb-4" />
          <Typography variant="h3" className="mb-2">No applications found</Typography>
          <p className="text-charcoal/50">Add an application above. Career page submissions will also show here when the site is live.</p>
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
                      {application.job_title}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-charcoal/70 mb-4">
                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{application.email}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{application.phone}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(application.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-charcoal/80 mb-2"><strong>Qualification:</strong> {application.qualification}</p>
                  {application.experience && (
                    <p className="text-sm text-charcoal/70 mb-4 whitespace-pre-wrap">{application.experience}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(application.documents || {}).map(([key, url]) => (
                      <a
                        key={key}
                        href={getImageUrl(url)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-lg bg-light-green text-deep-green hover:bg-deep-green hover:text-white transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {DOC_LABELS[key] || key}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {application.status !== 'hired' && (
                    <button
                      onClick={async () => {
                        try {
                          await api.post('/people/employees/hire', {
                            application_id: application.id,
                            designation: application.job_title,
                          });
                          toast.success('Hired — staff portal login emailed');
                          mutate();
                        } catch (error: any) {
                          toast.error(error.response?.data?.message || 'Hire failed');
                        }
                      }}
                      className="text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-full bg-deep-green text-white"
                    >
                      Hire
                    </button>
                  )}
                  <div className="relative">
                    <select
                      value={application.status}
                      onChange={(e) => handleStatusChange(application.id, e.target.value)}
                      className={`text-sm rounded-full px-3 py-1 border outline-none font-medium appearance-none pr-8 ${getStatusColor(application.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                  </div>
                  <button
                    onClick={() => handleDelete(application.id)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
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

const OPTIONAL_DOCS = [
  { id: 'photo', label: 'Photo' },
  { id: 'resume', label: 'Resume' },
  { id: 'aadhaar', label: 'Aadhaar' },
  { id: 'education', label: 'Education' },
  { id: 'address', label: 'Address proof' },
];

function AddApplicationForm({ onCreated }: { onCreated: () => void }) {
  const { data: careersData } = useSWR('/cms/global/careers', fetcher);
  const jobs: { id: string; title: string; isActive?: boolean }[] = careersData?.content || [];
  const [form, setForm] = useState({
    job_id: '',
    job_title: '',
    name: '',
    email: '',
    phone: '',
    qualification: '',
    experience: '',
  });
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error('Name, email, and phone are required');
      return;
    }
    const selectedJob = jobs.find((job) => job.id === form.job_id);
    const jobTitle = selectedJob?.title || form.job_title.trim();
    if (!jobTitle) {
      toast.error('Select a job or enter a job title');
      return;
    }
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('job_id', selectedJob?.id || `walk-in-${Date.now()}`);
      payload.append('job_title', jobTitle);
      payload.append('name', form.name.trim());
      payload.append('email', form.email.trim());
      payload.append('phone', form.phone.trim());
      payload.append('qualification', form.qualification.trim());
      payload.append('experience', form.experience.trim());
      Object.entries(files).forEach(([key, file]) => {
        if (file) payload.append(key, file);
      });
      await api.post('/job-applications/admin', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Application added');
      setForm({ job_id: '', job_title: '', name: '', email: '', phone: '', qualification: '', experience: '' });
      setFiles({});
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
        <p className="font-bold text-charcoal">Add job application</p>
        <p className="text-xs text-charcoal/50 mt-0.5">
          Use this for walk-in / offline candidates. Documents are optional. Career page submissions will still appear here when live.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <select
          value={form.job_id}
          onChange={(e) => setForm({ ...form, job_id: e.target.value, job_title: e.target.value ? '' : form.job_title })}
          className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm"
        >
          <option value="">Job opening — or type title</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>
        {!form.job_id && (
          <input
            placeholder="Job title"
            value={form.job_title}
            onChange={(e) => setForm({ ...form, job_title: e.target.value })}
            className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm"
          />
        )}
        <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        <input placeholder="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
      </div>
      <textarea
        placeholder="Experience notes (optional)"
        value={form.experience}
        onChange={(e) => setForm({ ...form, experience: e.target.value })}
        className="w-full border border-charcoal/10 rounded-xl px-3 py-2 text-sm min-h-[72px]"
      />
      <div className="flex flex-wrap gap-2">
        {OPTIONAL_DOCS.map((doc) => (
          <label key={doc.id} className="text-xs text-charcoal/60 border border-charcoal/10 rounded-xl px-3 py-2 cursor-pointer hover:border-deep-green/40">
            {doc.label}{files[doc.id] ? `: ${files[doc.id]?.name}` : ' (optional)'}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setFiles({ ...files, [doc.id]: e.target.files?.[0] || null })}
            />
          </label>
        ))}
      </div>
      <Button size="sm" disabled={saving} onClick={submit}>{saving ? 'Adding…' : 'Add application'}</Button>
    </div>
  );
}
