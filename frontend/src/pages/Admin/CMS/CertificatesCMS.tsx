import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Search, FileBadge, Upload } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { getImageUrl } from '@/utils/getImageUrl';
//

import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';
import type { Certificate } from '@/types';

export function CertificatesCMS() {
  const { data, mutate } = useSWR('/cms/global/certificates', fetcher);
  const certificates: Certificate[] = data?.content || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({ title: '', imageUrl: '' });

  const handleOpenModal = () => {
    setFormData({ title: '', imageUrl: '' });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      const uploadData = new FormData();
      uploadData.append('certificate', file);
      
      setIsUploading(true);
      const loadingToast = toast.loading('Uploading certificate...');
      
      try {
        const response = await api.post('/cms/upload/certificate', uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        const fileUrl = response.data.data.url;
        setFormData({ ...formData, imageUrl: fileUrl });
        toast.success('Certificate uploaded successfully!', { id: loadingToast });
      } catch (error) {
        console.error('Upload error', error);
        toast.error('Failed to upload certificate', { id: loadingToast });
      } finally {
        setIsUploading(false);
        // Reset input value so the same file can be uploaded again if it failed previously
        e.target.value = '';
      }
    }
  };

  const saveToBackend = async (newCerts: Certificate[]) => {
    try {
      mutate({ content: newCerts }, false);
      await api.put('/cms/global/certificates', { content: newCerts });
      mutate();
    } catch (error) {
      console.error('Failed to update certificates', error);
      mutate();
    }
  };

  const handleSave = () => {
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.imageUrl) {
      toast.error('Please upload a certificate image');
      return;
    }

    const newCert: Certificate = {
      id: `CERT-${Date.now()}`,
      ...formData
    };
    
    saveToBackend([...certificates, newCert]);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this certificate?')) {
      const certToDelete = certificates.find(c => c.id === id);
      const newCerts = certificates.filter(c => c.id !== id);
      
      // Update CMS database
      await saveToBackend(newCerts);
      
      // Delete the physical file from server if it's an uploaded image
      if (certToDelete && certToDelete.imageUrl && certToDelete.imageUrl.startsWith('/uploads/')) {
        try {
          await api.delete('/cms/upload/certificate', {
            data: { fileUrl: certToDelete.imageUrl }
          });
        } catch (error) {
          console.error('Failed to delete physical file', error);
        }
      }
    }
  };

  const filteredCerts = certificates.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Certificates CMS
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Manage official organization certificates and documents.
          </Typography>
        </div>
        <Button onClick={handleOpenModal} className="bg-goldenrod hover:bg-yellow-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Certificate
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden p-6">
        <div className="relative max-w-md w-full mb-6">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input 
            type="text" 
            placeholder="Search certificates..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCerts.map((cert) => (
            <div key={cert.id} className="border border-charcoal/10 rounded-2xl overflow-hidden group hover:shadow-lg transition-all">
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden flex items-center justify-center p-4">
                {cert.imageUrl ? (
                  <img src={getImageUrl(cert.imageUrl)} alt={cert.title} className="max-w-full max-h-full object-contain" />
                ) : (
                  <FileBadge className="w-12 h-12 text-charcoal/20" />
                )}
                <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleDelete(cert.id)} className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-white">
                <h4 className="font-bold text-charcoal text-sm truncate" title={cert.title}>{cert.title}</h4>
                <p className="text-xs text-charcoal/40 font-mono mt-1">{cert.id}</p>
              </div>
            </div>
          ))}
          {filteredCerts.length === 0 && (
            <div className="col-span-full py-12 text-center text-charcoal/50">
              No certificates found.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-charcoal/5 flex justify-between items-center">
              <Typography variant="h3">Add Certificate</Typography>
              <button onClick={() => setIsModalOpen(false)} className="text-charcoal/50 hover:text-charcoal"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" placeholder="e.g. 80G Certificate" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-2">Certificate Image</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {formData.imageUrl && (
                      <img src={getImageUrl(formData.imageUrl)} alt="Preview" className="w-20 h-20 object-contain border border-charcoal/10 rounded-xl bg-gray-50 p-2 shrink-0" />
                    )}
                    <label className="flex flex-col items-center justify-center flex-1 w-full h-20 border-2 border-charcoal/15 border-dashed rounded-xl cursor-pointer bg-white hover:bg-charcoal/5 transition-colors group">
                      <div className="flex items-center gap-2 text-charcoal/70 group-hover:text-deep-green transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">Click to upload Image</span>
                      </div>
                      <span className="text-xs text-charcoal/40 mt-1">PNG, JPG, SVG up to 5MB</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-charcoal/5 bg-gray-50 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isUploading}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={isUploading}>Add Certificate</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
