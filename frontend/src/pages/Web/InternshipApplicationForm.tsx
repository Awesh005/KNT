import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, Upload, FileText } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { PageBanner } from '@/components/common/PageBanner';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { resolveInternships } from '@/data/csrInternships';

export function InternshipApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useSWR('/cms/global/csr_internships', fetcher);
  const internships = resolveInternships(data?.content);
  const internship = internships.find((item) => item.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    course: '',
    year: '',
    duration: '',
    message: '',
  });

  useEffect(() => {
    if (!isLoading && !internship) {
      navigate('/csr');
    }
  }, [internship, isLoading, navigate]);

  useEffect(() => {
    if (internship?.duration) {
      setFormData((prev) => (prev.duration ? prev : { ...prev, duration: internship.duration }));
    }
  }, [internship]);

  if (isLoading || !internship) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      setResume(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('internship_id', internship.id);
      payload.append('internship_title', internship.title);
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('college', formData.college);
      payload.append('course', formData.course);
      payload.append('year', formData.year);
      payload.append('duration', formData.duration);
      payload.append('message', formData.message);
      if (resume) payload.append('resume', resume);

      await api.post('/intern-applications', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsSuccess(true);
      toast.success('Internship application submitted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      <PageBanner title="Internship Application" subtitle={`Applying for: ${internship.title}`} />

      <div className="container mx-auto px-4 max-w-4xl py-12">
        <button
          onClick={() => navigate('/csr')}
          className="flex items-center gap-2 text-charcoal/60 hover:text-deep-green font-bold mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to CSR Internships
        </button>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 shadow-sm border border-charcoal/10 text-center"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <Typography variant="h2" className="text-3xl font-bold text-deep-green mb-4">
              Application Submitted
            </Typography>
            <p className="text-charcoal/80 text-lg mb-8 max-w-lg mx-auto">
              Thank you for applying for <strong>{internship.title}</strong>. Our team will review your college details and get back to you.
            </p>
            <button
              onClick={() => navigate('/csr')}
              className="bg-deep-green hover:bg-[#1a4a38] text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              View Other Internships
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-charcoal/10"
          >
            <div className="mb-10 pb-8 border-b border-charcoal/10">
              <Typography variant="h3" className="text-2xl font-bold text-deep-green mb-2">
                Student Details
              </Typography>
              <p className="text-charcoal/60">Use the name and college as they appear on your ID card.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-charcoal font-bold mb-2">Full Name *</label>
                  <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-charcoal font-bold mb-2">Email Address *</label>
                  <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-charcoal font-bold mb-2">Mobile Number *</label>
                  <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none" />
                </div>
                <div>
                  <label htmlFor="college" className="block text-charcoal font-bold mb-2">College / University *</label>
                  <input type="text" id="college" name="college" required value={formData.college} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none" />
                </div>
                <div>
                  <label htmlFor="course" className="block text-charcoal font-bold mb-2">Course *</label>
                  <input type="text" id="course" name="course" required value={formData.course} onChange={handleChange} placeholder="e.g. B.A. / B.Sc. / B.Ed / MSW" className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none" />
                </div>
                <div>
                  <label htmlFor="year" className="block text-charcoal font-bold mb-2">Year of Study</label>
                  <input type="text" id="year" name="year" value={formData.year} onChange={handleChange} placeholder="e.g. 2nd year" className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="duration" className="block text-charcoal font-bold mb-2">Preferred Duration</label>
                  <input type="text" id="duration" name="duration" value={formData.duration} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none" />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-charcoal font-bold mb-2">Why this internship?</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="A few lines about your interest and availability..." className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none resize-none" />
              </div>

              <div className="pt-8 border-t border-charcoal/10">
                <Typography variant="h3" className="text-2xl font-bold text-deep-green mb-2">
                  Resume (optional)
                </Typography>
                <p className="text-charcoal/60 mb-6">PDF, JPG, or PNG. Max 5MB.</p>
                <div className="bg-[#FDFBF7] p-4 rounded-xl border border-charcoal/10 max-w-md">
                  <div className="relative">
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 border-dashed ${resume ? 'border-deep-green bg-deep-green/5' : 'border-charcoal/20 bg-white'}`}>
                      <div className="flex items-center gap-2 truncate">
                        {resume ? <FileText className="w-5 h-5 text-deep-green shrink-0" /> : <Upload className="w-5 h-5 text-charcoal/40 shrink-0" />}
                        <span className={`text-sm truncate ${resume ? 'text-deep-green font-medium' : 'text-charcoal/50'}`}>
                          {resume ? resume.name : 'Choose a file...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-charcoal/10 flex items-center justify-end gap-4">
                <button type="button" onClick={() => navigate('/csr')} className="px-6 py-3 rounded-xl font-bold text-charcoal hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-goldenrod hover:bg-deep-green text-white font-bold py-3 px-10 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70">
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
