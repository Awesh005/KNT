import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';

export function FeaturedMomentsCMS() {
  const { data, mutate } = useSWR('/cms/global/featured_moments', fetcher);
  const moments: any[] = data?.content || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMoment, setEditingMoment] = useState<any | null>(null);
  const [formData, setFormData] = useState({ text: '', image: '' });
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenModal = (moment?: any) => {
    if (moment) {
      setEditingMoment(moment);
      setFormData({ text: moment.text, image: moment.image });
    } else {
      setEditingMoment(null);
      setFormData({ text: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const saveToBackend = async (newContent: any, successMessage: string = 'Featured moments updated successfully') => {
    try {
      mutate({ content: newContent }, false);
      await api.put('/cms/global/featured_moments', { content: newContent });
      toast.success(successMessage);
      mutate();
    } catch (error: any) {
      console.error('Failed to update featured moments', error);
      toast.error(error.message || 'Failed to update featured moments');
      mutate();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      setIsUploading(true);
      const res = await api.post('/cms/upload/featured-moment', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, image: res.data.data.fileUrl });
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!formData.image) return;
    try {
      setIsUploading(true);
      if (formData.image.startsWith('/uploads/')) {
        await api.delete('/cms/upload/featured-moment', { data: { fileUrl: formData.image } });
      }
      setFormData({ ...formData, image: '' });
      toast.success('Image removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!formData.text) {
      toast.error('Please enter a title');
      return;
    }

    let newContent = [...moments];
    let isEdit = false;
    
    if (editingMoment) {
      const index = newContent.findIndex((m: any) => m.id === editingMoment.id);
      if (index !== -1) {
        newContent[index] = { ...editingMoment, text: formData.text, image: formData.image };
        isEdit = true;
      }
    } else {
      newContent.push({
        id: Date.now(),
        text: formData.text,
        image: formData.image,
      });
    }
    
    saveToBackend(newContent, isEdit ? 'Featured moment updated successfully' : 'Featured moment added successfully');
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this moment?')) {
      const newContent = [...moments];
      const index = newContent.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        const itemToDelete = newContent[index];
        if (itemToDelete.image && itemToDelete.image.startsWith('/uploads/')) {
          try {
            await api.delete('/cms/upload/featured-moment', { data: { fileUrl: itemToDelete.image } });
          } catch (e) {
            console.error('Failed to delete image file', e);
          }
        }
        
        newContent.splice(index, 1);
        saveToBackend(newContent, 'Featured moment deleted successfully');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Featured Moments CMS
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Manage the featured moments displayed on the home page.
          </Typography>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-goldenrod hover:bg-yellow-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Moment
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {moments.map((item) => (
            <div key={item.id} className="border border-charcoal/10 rounded-2xl overflow-hidden group relative">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                {item.image ? (
                  <img src={getImageUrl(item.image)} alt={item.text} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-charcoal/20">No Image</div>
                )}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <p className="text-white font-bold text-sm mb-4 line-clamp-3">{item.text}</p>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => handleOpenModal(item)} 
                    className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {moments.length === 0 && (
            <div className="col-span-full py-12 text-center text-charcoal/50">
              No featured moments found.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-charcoal/5 flex justify-between items-center">
              <Typography variant="h3">{editingMoment ? 'Edit' : 'Add'} Featured Moment</Typography>
              <button onClick={() => setIsModalOpen(false)} className="text-charcoal/50 hover:text-charcoal"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Text / Description</label>
                  <textarea rows={3} value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Moment Image</label>
                  <div className="flex items-center gap-4">
                    {formData.image && (
                      <div className="relative group">
                        <img src={getImageUrl(formData.image)} alt="Moment" className="w-12 h-12 object-cover rounded-lg border border-charcoal/10" />
                        <button
                          type="button"
                          onClick={handleImageDelete}
                          disabled={isUploading}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="w-full text-sm text-charcoal/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-deep-green/10 file:text-deep-green hover:file:bg-deep-green/20"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-charcoal/5 bg-gray-50 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" onClick={handleSave}>{editingMoment ? 'Save Changes' : 'Add Moment'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
