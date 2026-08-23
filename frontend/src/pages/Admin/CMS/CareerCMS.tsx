import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, CheckCircle, XCircle, Save } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
//

import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';

export function CareerCMS() {
  const { data, mutate } = useSWR('/cms/global/careers', fetcher);
  const jobs: any[] = data?.content || [];
  
  const { data: noticeData, mutate: mutateNotice } = useSWR('/cms/global/career_notice', fetcher);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [noticeForm, setNoticeForm] = useState({ publicNotice: '', keyInformation: [] as any[] });
  
  useEffect(() => {
    if (noticeData?.content) {
      setNoticeForm(noticeData.content);
    }
  }, [noticeData]);

  const handleNoticeSave = async () => {
    try {
      mutateNotice({ content: noticeForm }, false);
      await api.put('/cms/global/career_notice', { content: noticeForm });
      mutateNotice();
      toast.success('Notice saved successfully!');
    } catch (error) {
      console.error('Failed to update notice', error);
      mutateNotice();
    }
  };
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [formData, setFormData] = useState({ title: '', vacancies: 0, qualifications: '', salaryRange: '', isActive: true });

  const handleOpenModal = (job?: any) => {
    if (job) {
      setEditingJob(job);
      setFormData({ 
        title: job.title, 
        vacancies: job.vacancies, 
        qualifications: job.qualifications, 
        salaryRange: job.salaryRange, 
        isActive: job.isActive 
      });
    } else {
      setEditingJob(null);
      setFormData({ title: '', vacancies: 1, qualifications: '', salaryRange: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const saveToBackend = async (newJobs: any[], successMessage: string = 'Jobs updated successfully') => {
    try {
      mutate({ content: newJobs }, false);
      await api.put('/cms/global/careers', { content: newJobs });
      toast.success(successMessage);
      mutate();
    } catch (error: any) {
      console.error('Failed to update careers', error);
      toast.error(error.message || 'Failed to update careers');
      mutate();
    }
  };

  const handleSave = () => {
    if (!formData.title) return;

    let newJobs = [...jobs];
    let isEdit = false;
    if (editingJob) {
      const index = newJobs.findIndex((j: any) => j.id === editingJob.id);
      if (index !== -1) {
        newJobs[index] = { ...editingJob, ...formData };
        isEdit = true;
      }
    } else {
      newJobs.push({ id: `job-${Date.now()}`, ...formData });
    }
    
    saveToBackend(newJobs, isEdit ? 'Job updated successfully' : 'Job created successfully');
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    const newJobs = [...jobs];
    const index = newJobs.findIndex((j: any) => j.id === id);
    if (index !== -1) {
      newJobs[index].isActive = !currentStatus;
      saveToBackend(newJobs, `Job ${currentStatus ? 'closed' : 'activated'} successfully`);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      const newJobs = [...jobs];
      const index = newJobs.findIndex((j: any) => j.id === id);
      if (index !== -1) {
        newJobs.splice(index, 1);
        saveToBackend(newJobs, 'Job deleted successfully');
      }
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Career CMS
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Manage job postings and vacancies.
          </Typography>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-goldenrod hover:bg-yellow-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Job Posting
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-charcoal/5 pb-4">
          <Typography variant="h3" className="!text-lg text-deep-green">Employment Notice Settings</Typography>
          <Button onClick={handleNoticeSave} className="bg-goldenrod hover:bg-yellow-600 text-white py-2">
            <Save className="w-4 h-4 mr-2" /> Save Notice
          </Button>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Public Notice Text</label>
          <textarea 
            value={noticeForm.publicNotice} 
            onChange={e => setNoticeForm({...noticeForm, publicNotice: e.target.value})} 
            className="w-full p-3 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green h-24 resize-none" 
            placeholder="Mega Job Offer details..."
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-charcoal/70 uppercase mb-3">Key Information</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {noticeForm.keyInformation.map((info: any, idx: number) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-charcoal/10">
                <label className="block text-xs font-bold text-charcoal/70 mb-1">{info.label}</label>
                <input 
                  type="text" 
                  value={info.value} 
                  onChange={e => {
                    const newInfo = [...noticeForm.keyInformation];
                    newInfo[idx].value = e.target.value;
                    setNoticeForm({...noticeForm, keyInformation: newInfo});
                  }} 
                  className="w-full p-2 border border-charcoal/10 rounded-md outline-none focus:border-deep-green text-sm" 
                />
              </div>
            ))}
          </div>
          {noticeForm.keyInformation.length === 0 && (
            <p className="text-sm text-charcoal/50 italic">No key information found. Seed the database to edit these fields.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        <div className="p-4 border-b border-charcoal/5 flex bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input 
              type="text" 
              placeholder="Search jobs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-charcoal/60 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Vacancies</th>
                <th className="px-6 py-4">Qualifications</th>
                <th className="px-6 py-4">Salary Range</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-charcoal">{job.title}</td>
                  <td className="px-6 py-4 text-charcoal/70">{job.vacancies}</td>
                  <td className="px-6 py-4 text-charcoal/60 line-clamp-1 max-w-[200px]" title={job.qualifications}>{job.qualifications}</td>
                  <td className="px-6 py-4 text-charcoal/70">{job.salaryRange}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase ${job.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {job.isActive ? 'Active' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleToggleStatus(job.id, job.isActive)} className={`p-1.5 rounded-lg transition-colors ${job.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`} title={job.isActive ? 'Close Job' : 'Activate Job'}>
                        {job.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleOpenModal(job)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(job.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-charcoal/5 flex justify-between items-center">
              <Typography variant="h3">{editingJob ? 'Edit Job' : 'Add Job'}</Typography>
              <button onClick={() => setIsModalOpen(false)} className="text-charcoal/50 hover:text-charcoal"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Job Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Vacancies</label>
                  <input type="number" value={formData.vacancies} onChange={e => setFormData({...formData, vacancies: Number(e.target.value)})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Salary Range</label>
                  <input type="text" value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Qualifications</label>
                  <textarea value={formData.qualifications} onChange={e => setFormData({...formData, qualifications: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green h-20 resize-none" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-deep-green" />
                  <label htmlFor="isActive" className="text-sm font-medium text-charcoal">Is Active?</label>
                </div>
              </div>
              <div className="p-6 border-t border-charcoal/5 bg-gray-50 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Job</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
