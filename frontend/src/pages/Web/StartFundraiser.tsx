import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, Upload, FileText, HeartHandshake } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { Typography } from '@/components/common/Typography';
import { PageBanner } from '@/components/common/PageBanner';

export function StartFundraiser() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/start-fundraiser');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    goalAmount: '',
    beneficiaryName: '',
    story: '',
    phone: '',
    email: '',
    accountHolderName: '',
    accountNumber: ''
  });

  const [files, setFiles] = useState<{
    coverImages: File[];
    patientId: File | null;
    medicalDoc: File | null;
  }>({
    coverImages: [],
    patientId: null,
    medicalDoc: null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        e.target.value = '';
        return;
      }
      setFiles({ ...files, [fieldName]: file });
    }
  };

  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newTotal = files.coverImages.length + selectedFiles.length;
      
      if (newTotal > 3) {
        alert('You can only upload up to 3 cover images. Please select fewer images or clear the current selection.');
        e.target.value = '';
        return;
      }
      
      for (const file of selectedFiles) {
        if (file.size > 2 * 1024 * 1024) {
          alert('Each file size must be less than 2MB');
          e.target.value = '';
          return;
        }
      }
      setFiles({ ...files, coverImages: [...files.coverImages, ...selectedFiles] });
      // Reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const documentUrls: string[] = [];
      const coverImageUrls: string[] = [];

      // Upload cover images
      for (const file of files.coverImages) {
        const formData = new FormData();
        formData.append('document', file);
        const res = await api.post('/requests/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        coverImageUrls.push(res.data.data.fileUrl);
      }

      // Upload patient ID
      if (files.patientId) {
        const formData = new FormData();
        formData.append('document', files.patientId);
        const res = await api.post('/requests/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        documentUrls.push(res.data.data.fileUrl);
      }

      // Upload medical doc
      if (files.medicalDoc) {
        const formData = new FormData();
        formData.append('document', files.medicalDoc);
        const res = await api.post('/requests/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        documentUrls.push(res.data.data.fileUrl);
      }

      const payload = {
        beneficiary_name: formData.beneficiaryName,
        category: formData.category,
        story: formData.title + "\n\n" + formData.story,
        target_amount: parseInt(formData.goalAmount, 10),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        account_holder_name: formData.accountHolderName,
        account_number: formData.accountNumber,
        cover_images: coverImageUrls,
        documents: documentUrls
      };
      
      await api.post('/requests', payload);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      <PageBanner 
        title="Start a Fundraiser"
        subtitle="Create a campaign to raise funds for a medical emergency, education, or social cause."
      />

      <div className="container mx-auto px-4 max-w-4xl py-12">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-charcoal/60 hover:text-deep-green font-bold mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Home
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
              Fundraiser Request Submitted!
            </Typography>
            <p className="text-charcoal/80 text-lg mb-8 max-w-lg mx-auto">
              Your fundraiser request is now <strong>under review</strong>. Our admin team will verify the documents and approve your campaign shortly. You will be notified via email/phone once it goes live.
            </p>
            <button 
              onClick={() => navigate('/campaigns')}
              className="bg-deep-green hover:bg-[#1a4a38] text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              View Active Campaigns
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-charcoal/10"
          >
            <div className="mb-10 pb-8 border-b border-charcoal/10 flex items-start justify-between">
              <div>
                <Typography variant="h3" className="text-2xl font-bold text-deep-green mb-2">
                  Campaign Details
                </Typography>
                <p className="text-charcoal/60">Fill out this form to set up your fundraising campaign.</p>
              </div>
              <div className="w-12 h-12 bg-goldenrod/10 rounded-full flex items-center justify-center hidden sm:flex">
                <HeartHandshake className="w-6 h-6 text-goldenrod" />
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-charcoal font-bold mb-2">Campaign Title *</label>
                  <input 
                    type="text" 
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Help Rahul fight Cancer"
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-charcoal font-bold mb-2">Category *</label>
                  <select 
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none transition-all bg-white"
                  >
                    <option value="">Select a Category</option>
                    <option value="Medical">Medical / Health</option>
                    <option value="Education">Education</option>
                    <option value="Relief">Disaster Relief</option>
                    <option value="Community">Community Support</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="goalAmount" className="block text-charcoal font-bold mb-2">Goal Amount (₹) *</label>
                  <input 
                    type="number" 
                    id="goalAmount"
                    name="goalAmount"
                    required
                    min="1000"
                    value={formData.goalAmount}
                    onChange={handleChange}
                    placeholder="e.g. 500000"
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none transition-all"
                  />
                </div>
              </div>

              {/* Beneficiary Details */}
              <div className="pt-8 border-t border-charcoal/10">
                <Typography variant="h3" className="text-xl font-bold text-deep-green mb-6">
                  Beneficiary & Story
                </Typography>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="beneficiaryName" className="block text-charcoal font-bold mb-2">Beneficiary Name * (Who are you raising funds for?)</label>
                    <input 
                      type="text" 
                      id="beneficiaryName"
                      name="beneficiaryName"
                      required
                      value={formData.beneficiaryName}
                      onChange={handleChange}
                      placeholder="Name of the person/community"
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="story" className="block text-charcoal font-bold mb-2">Campaign Story (Optional)</label>
                    <textarea 
                      id="story"
                      name="story"
                      value={formData.story}
                      onChange={handleChange}
                      placeholder="Explain why you are raising funds, how the funds will be used, and the current situation..."
                      className="w-full min-h-[160px] px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="pt-8 border-t border-charcoal/10">
                <Typography variant="h3" className="text-xl font-bold text-deep-green mb-6">
                  Your Contact Information
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
              </div>

              {/* Bank Details for Payout */}
              <div className="pt-8 border-t border-charcoal/10">
                <Typography variant="h3" className="text-xl font-bold text-deep-green mb-6">
                  Bank Details for Payout
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="accountHolderName" className="block text-charcoal font-bold mb-2">Account Holder Name *</label>
                    <input 
                      type="text" 
                      id="accountHolderName"
                      name="accountHolderName"
                      required
                      value={formData.accountHolderName}
                      onChange={handleChange}
                      placeholder="Name as per bank account"
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="accountNumber" className="block text-charcoal font-bold mb-2">Account Number *</label>
                    <input 
                      type="text" 
                      id="accountNumber"
                      name="accountNumber"
                      required
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="Account number"
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-deep-green focus:ring-1 focus:ring-deep-green outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Document Uploads */}
              <div className="pt-8 border-t border-charcoal/10">
                <Typography variant="h3" className="text-xl font-bold text-deep-green mb-2">
                  Media & Documents
                </Typography>
                <p className="text-charcoal/60 mb-8 text-sm">
                  Upload clear photos and supporting documents to verify your campaign. Max size: <strong>2MB</strong> per file.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cover Images */}
                  <div className="bg-[#FDFBF7] p-4 rounded-xl border border-charcoal/10">
                    <label className="block text-charcoal font-bold text-sm mb-3">
                      Campaign Cover Photos (Max 3) *
                    </label>
                    <div className="relative">
                      <input 
                        type="file" 
                        required={files.coverImages.length === 0}
                        multiple
                        accept="image/png, image/jpeg"
                        onChange={handleMultipleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 border-dashed ${files.coverImages.length > 0 ? 'border-deep-green bg-deep-green/5' : 'border-charcoal/20 bg-white'} transition-colors`}>
                        <div className="flex flex-col gap-1 truncate w-full">
                          <div className="flex items-center gap-2">
                            {files.coverImages.length > 0 ? (
                              <FileText className="w-5 h-5 text-deep-green shrink-0" />
                            ) : (
                              <Upload className="w-5 h-5 text-charcoal/40 shrink-0" />
                            )}
                            <span className={`text-sm truncate ${files.coverImages.length > 0 ? 'text-deep-green font-medium' : 'text-charcoal/50'}`}>
                              {files.coverImages.length > 0 ? `${files.coverImages.length} image(s) selected` : 'Upload up to 3 images (JPG, PNG)'}
                            </span>
                          </div>
                          {files.coverImages.length > 0 && (
                            <div className="flex flex-col gap-1 pl-7">
                              <div className="text-xs text-charcoal/60 truncate">
                                {files.coverImages.map(f => f.name).join(', ')}
                              </div>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFiles({ ...files, coverImages: [] });
                                }}
                                className="text-xs text-red-500 hover:text-red-700 hover:underline w-fit text-left"
                              >
                                Clear selection
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patient/Beneficiary ID */}
                  <div className="bg-[#FDFBF7] p-4 rounded-xl border border-charcoal/10">
                    <label className="block text-charcoal font-bold text-sm mb-3">
                      Beneficiary ID Proof (Aadhaar/PAN) *
                    </label>
                    <div className="relative">
                      <input 
                        type="file" 
                        required
                        accept=".pdf, image/png, image/jpeg"
                        onChange={(e) => handleFileChange(e, 'patientId')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 border-dashed ${files.patientId ? 'border-deep-green bg-deep-green/5' : 'border-charcoal/20 bg-white'} transition-colors`}>
                        <div className="flex items-center gap-2 truncate">
                          {files.patientId ? (
                            <FileText className="w-5 h-5 text-deep-green shrink-0" />
                          ) : (
                            <Upload className="w-5 h-5 text-charcoal/40 shrink-0" />
                          )}
                          <span className={`text-sm truncate ${files.patientId ? 'text-deep-green font-medium' : 'text-charcoal/50'}`}>
                            {files.patientId ? files.patientId?.name : 'Upload file (PDF, Image)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical / Supporting Docs */}
                  <div className="bg-[#FDFBF7] p-4 rounded-xl border border-charcoal/10 md:col-span-2">
                    <label className="block text-charcoal font-bold text-sm mb-3">
                      Supporting Documents (Medical Bills, Estimates, etc.) *
                    </label>
                    <div className="relative">
                      <input 
                        type="file" 
                        required
                        accept=".pdf, image/png, image/jpeg"
                        onChange={(e) => handleFileChange(e, 'medicalDoc')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 border-dashed ${files.medicalDoc ? 'border-deep-green bg-deep-green/5' : 'border-charcoal/20 bg-white'} transition-colors`}>
                        <div className="flex items-center gap-2 truncate">
                          {files.medicalDoc ? (
                            <FileText className="w-5 h-5 text-deep-green shrink-0" />
                          ) : (
                            <Upload className="w-5 h-5 text-charcoal/40 shrink-0" />
                          )}
                          <span className={`text-sm truncate ${files.medicalDoc ? 'text-deep-green font-medium' : 'text-charcoal/50'}`}>
                            {files.medicalDoc ? files.medicalDoc?.name : 'Upload combined PDF or Image'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-charcoal/10">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-8">
                  <p className="text-sm text-red-800">
                    <strong>Disclaimer:</strong> By submitting this form, you declare that all provided information is accurate and authentic. Fraudulent campaigns will be permanently banned and reported.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-4">
                  <button 
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-6 py-3 rounded-xl font-bold text-charcoal hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-goldenrod hover:bg-deep-green text-white font-bold py-3 px-10 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
