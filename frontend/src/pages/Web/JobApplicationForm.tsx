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

export function JobApplicationForm() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { data } = useSWR('/cms/global/careers', fetcher);
  const jobs = data?.content || [];
  
  const job = jobs.find((j: any) => j.id === jobId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    experience: ''
  });

  // Since it's a mock form, we just track if files are selected for UI purposes
  const [files, setFiles] = useState<Record<string, File | null>>({
    photo: null,
    aadhaar: null,
    pan: null,
    education: null,
    resume: null,
    experienceDoc: null,
    caste: null,
    address: null
  });

  useEffect(() => {
    // If job not found, redirect to careers
    if (!job) {
      navigate('/career');
    }
  }, [job, navigate]);

  if (!job) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      setFiles({ ...files, [fieldName]: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('job_id', job.id);
      payload.append('job_title', job.title);
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('qualification', formData.qualification);
      payload.append('experience', formData.experience);

      Object.entries(files).forEach(([key, file]) => {
        if (file) payload.append(key, file);
      });

      await api.post('/job-applications', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsSuccess(true);
      toast.success('Application submitted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFields = [
    { id: 'photo', label: 'Passport Size Photograph', required: true },
    { id: 'aadhaar', label: 'Aadhaar Card Copy', required: true },
    { id: 'pan', label: 'PAN Card Copy (If available)', required: false },
    { id: 'education', label: 'Educational Certificates', required: true },
    { id: 'resume', label: 'Resume / CV', required: true },
    { id: 'experienceDoc', label: 'Experience Certificate (If any)', required: false },
    { id: 'caste', label: 'Caste Certificate (If applicable)', required: false },
    { id: 'address', label: 'Address Proof', required: true },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      <PageBanner 
        title="Application Form"
        subtitle={`Applying for: ${job.title}`}
      />

      <div className="container mx-auto px-4 max-w-4xl py-12">
        <button 
          onClick={() => navigate('/career')}
          className="flex items-center gap-2 text-charcoal/60 hover:text-deep-green font-bold mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Careers
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
              Application Submitted!
            </Typography>
            <p className="text-charcoal/80 text-lg mb-8 max-w-lg mx-auto">
              Thank you for applying for the <strong>{job.title}</strong> position. Our HR team will review your application and required documents. We will get back to you soon.
            </p>
            <button 
              onClick={() => navigate('/career')}
              className="bg-deep-green hover:bg-[#1a4a38] text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              Explore More Opportunities
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
                Personal Details
              </Typography>
              <p className="text-charcoal/60">Please fill in your correct information as per your official documents.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-charcoal font-bold mb-2">Full Name *</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-charcoal font-bold mb-2">Email Address *</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-charcoal font-bold mb-2">Mobile Number *</label>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="qualification" className="block text-charcoal font-bold mb-2">Highest Qualification *</label>
                  <input 
                    type="text" 
                    id="qualification"
                    name="qualification"
                    required
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g. 10th / 12th / Graduate"
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="experience" className="block text-charcoal font-bold mb-2">Relevant Experience Details</label>
                <textarea 
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Describe your previous experience briefly..."
                  className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none transition-all resize-none"
                />
              </div>

              {/* Document Uploads */}
              <div className="pt-8 border-t border-charcoal/10">
                <Typography variant="h3" className="text-2xl font-bold text-deep-green mb-2">
                  Required Documents
                </Typography>
                <p className="text-charcoal/60 mb-8">
                  Please upload the following documents. Allowed formats: <strong>PDF, JPG, PNG</strong>. Max size: <strong>5MB</strong> per file.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {uploadFields.map((field) => (
                    <div key={field.id} className="bg-[#FDFBF7] p-4 rounded-xl border border-charcoal/10">
                      <label className="block text-charcoal font-bold text-sm mb-3">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <input 
                          type="file" 
                          id={field.id}
                          required={field.required}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, field.id)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 border-dashed ${files[field.id] ? 'border-deep-green bg-deep-green/5' : 'border-charcoal/20 bg-white'} transition-colors`}>
                          <div className="flex items-center gap-2 truncate">
                            {files[field.id] ? (
                              <FileText className="w-5 h-5 text-deep-green shrink-0" />
                            ) : (
                              <Upload className="w-5 h-5 text-charcoal/40 shrink-0" />
                            )}
                            <span className={`text-sm truncate ${files[field.id] ? 'text-deep-green font-medium' : 'text-charcoal/50'}`}>
                              {files[field.id] ? files[field.id]?.name : 'Choose a file...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-charcoal/10 flex items-center justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => navigate('/career')}
                  className="px-6 py-3 rounded-xl font-bold text-charcoal hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-goldenrod hover:bg-deep-green text-white font-bold py-3 px-10 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Final Application'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
