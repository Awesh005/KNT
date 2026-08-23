import { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';

export function GalleryCMS() {
  const { data, mutate } = useSWR('/cms/global/gallery', fetcher);
  const galleryContent = data?.content || { images: [], videos: [] };
  const images: any[] = galleryContent.images || [];
  const videos: any[] = galleryContent.videos || [];
  
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '', videoUrl: '' });
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenModal = () => {
    setFormData({ title: '', url: '', videoUrl: '' });
    setIsModalOpen(true);
  };

  const saveToBackend = async (newContent: any, successMessage: string = 'Gallery updated successfully') => {
    try {
      mutate({ content: newContent }, false);
      await api.put('/cms/global/gallery', { content: newContent });
      toast.success(successMessage);
      mutate();
    } catch (error: any) {
      console.error('Failed to update gallery', error);
      toast.error(error.message || 'Failed to update gallery');
      mutate();
    }
  };

  const handleSave = () => {
    if (!formData.title) {
      toast.error('Please enter a title or caption');
      return;
    }
    if (!formData.url) {
      toast.error(`Please upload ${activeTab === 'videos' ? 'a thumbnail image' : 'an image'}`);
      return;
    }
    if (activeTab === 'videos' && !formData.videoUrl) {
      toast.error('Please upload a video file');
      return;
    }

    const newContent = {
      images: [...images],
      videos: [...videos]
    };

    if (activeTab === 'images') {
      newContent.images.push({
        id: Date.now(),
        title: formData.title,
        url: formData.url,
      });
    } else {
      newContent.videos.push({
        id: Date.now(),
        title: formData.title,
        url: formData.url, // thumbnail
        isVideo: true,
        videoUrl: formData.videoUrl || formData.url,
      });
    }
    saveToBackend(newContent, `${activeTab === 'images' ? 'Image' : 'Video'} added successfully`);
    setIsModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'url' | 'videoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    const endpoint = activeTab === 'images' 
      ? '/cms/upload/gallery-image' 
      : (field === 'videoUrl' ? '/cms/upload/gallery-video' : '/cms/upload/gallery-image');
    
    // For images, multer expects 'image', for videos 'video'
    const fieldName = endpoint.includes('video') ? 'video' : 'image';
    formDataUpload.append(fieldName, file);

    try {
      setIsUploading(true);
      const res = await api.post(endpoint, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, [field]: res.data.data.fileUrl });
      toast.success(`${field === 'videoUrl' ? 'Video' : 'Image'} uploaded successfully`);
    } catch (error: any) {
      toast.error(error.message || `Failed to upload ${field === 'videoUrl' ? 'video' : 'image'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (field: 'url' | 'videoUrl') => {
    if (!formData[field]) return;
    try {
      setIsUploading(true);
      const urlToDelete = formData[field];
      if (urlToDelete.startsWith('/uploads/')) {
        const endpoint = urlToDelete.includes('videos') ? '/cms/upload/gallery-video' : '/cms/upload/gallery-image';
        await api.delete(endpoint, { data: { fileUrl: urlToDelete } });
      }
      setFormData({ ...formData, [field]: '' });
      toast.success(`${field === 'videoUrl' ? 'Video' : 'Image'} removed successfully`);
    } catch (error: any) {
      toast.error(error.message || `Failed to remove ${field === 'videoUrl' ? 'video' : 'image'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number, type: 'images' | 'videos') => {
    if (confirm(`Are you sure you want to delete this ${type === 'images' ? 'image' : 'video'}?`)) {
      const newContent = {
        images: [...images],
        videos: [...videos]
      };
      
      const index = newContent[type].findIndex((item: any) => item.id === id);
      if (index !== -1) {
        const itemToDelete = newContent[type][index];
        
        if (itemToDelete.url && itemToDelete.url.startsWith('/uploads/')) {
          try {
            await api.delete('/cms/upload/gallery-image', { data: { fileUrl: itemToDelete.url } });
          } catch (e) {
            console.error('Failed to delete thumbnail/image', e);
          }
        }
        
        if (type === 'videos' && itemToDelete.videoUrl && itemToDelete.videoUrl.startsWith('/uploads/')) {
          try {
            await api.delete('/cms/upload/gallery-video', { data: { fileUrl: itemToDelete.videoUrl } });
          } catch (e) {
            console.error('Failed to delete video file', e);
          }
        }

        newContent[type].splice(index, 1);
        saveToBackend(newContent, `${type === 'images' ? 'Image' : 'Video'} deleted successfully`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Gallery CMS
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Manage photos and videos displayed in the public gallery.
          </Typography>
        </div>
        <Button onClick={handleOpenModal} className="bg-goldenrod hover:bg-yellow-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add {activeTab === 'images' ? 'Image' : 'Video'}
        </Button>
      </div>

      <div className="flex border-b border-charcoal/10 gap-6">
        <button 
          onClick={() => setActiveTab('images')}
          className={`pb-3 text-sm font-bold uppercase transition-colors relative ${activeTab === 'images' ? 'text-deep-green' : 'text-charcoal/40 hover:text-charcoal/70'}`}
        >
          <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Images</span>
          {activeTab === 'images' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-goldenrod rounded-t-md" />}
        </button>
        <button 
          onClick={() => setActiveTab('videos')}
          className={`pb-3 text-sm font-bold uppercase transition-colors relative ${activeTab === 'videos' ? 'text-deep-green' : 'text-charcoal/40 hover:text-charcoal/70'}`}
        >
          <span className="flex items-center gap-2"><VideoIcon className="w-4 h-4" /> Videos</span>
          {activeTab === 'videos' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-goldenrod rounded-t-md" />}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(activeTab === 'images' ? images : videos).map((item) => (
            <div key={item.id} className="border border-charcoal/10 rounded-2xl overflow-hidden group relative">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                <img src={getImageUrl(item.url)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                {activeTab === 'videos' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <p className="text-white font-bold text-sm truncate mb-2">{item.title}</p>
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleDelete(item.id, activeTab)} 
                    className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(activeTab === 'images' ? images : videos).length === 0 && (
            <div className="col-span-full py-12 text-center text-charcoal/50">
              No {activeTab} found.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-charcoal/5 flex justify-between items-center">
              <Typography variant="h3">Add {activeTab === 'images' ? 'Image' : 'Video'}</Typography>
              <button onClick={() => setIsModalOpen(false)} className="text-charcoal/50 hover:text-charcoal"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Title / Caption</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">{activeTab === 'videos' ? 'Thumbnail Image' : 'Gallery Image'}</label>
                  <div className="flex items-center gap-4">
                    {formData.url && (
                      <div className="relative group">
                        <img src={getImageUrl(formData.url)} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-charcoal/10" />
                        <button
                          type="button"
                          onClick={() => handleFileDelete('url')}
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
                      onChange={(e) => handleFileUpload(e, 'url')}
                      disabled={isUploading}
                      className="w-full text-sm text-charcoal/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-deep-green/10 file:text-deep-green hover:file:bg-deep-green/20"
                    />
                  </div>
                </div>
                {activeTab === 'videos' && (
                  <div>
                    <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Video File (Max 20MB)</label>
                    <div className="flex items-center gap-4">
                      {formData.videoUrl && (
                        <div className="relative group">
                          <div className="w-12 h-12 bg-charcoal/10 rounded-lg flex items-center justify-center">
                            <VideoIcon className="w-6 h-6 text-charcoal/50" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFileDelete('videoUrl')}
                            disabled={isUploading}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 'videoUrl')}
                        disabled={isUploading}
                        className="w-full text-sm text-charcoal/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-deep-green/10 file:text-deep-green hover:file:bg-deep-green/20"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-charcoal/5 bg-gray-50 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={isUploading}>Add to Gallery</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
