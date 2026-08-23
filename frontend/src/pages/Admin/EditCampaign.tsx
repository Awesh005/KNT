import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Upload, X } from 'lucide-react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { fetcher, api } from '@/lib/fetcher';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { getImageUrl } from '@/utils/getImageUrl';

export function EditCampaign() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: campaignRes, error, mutate } = useSWR(id ? `/campaigns/${id}` : null, fetcher);
  
  const campaign = campaignRes?.campaign;
  
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  useEffect(() => {
    if (campaign) {
      setEditingCampaign({
        id: campaign.id,
        title: campaign.title,
        category: campaign.category,
        targetAmount: campaign.target_amount || campaign.targetAmount || 0,
        story: campaign.story,
        videoUrl: campaign.video_url || campaign.videoUrl || '',
        documents: campaign.documents || [],
        coverImage: Array.isArray(campaign.cover_image || campaign.coverImage) 
          ? (campaign.cover_image || campaign.coverImage) 
          : (campaign.cover_image || campaign.coverImage ? [campaign.cover_image || campaign.coverImage] : [])
      });
    }
  }, [campaign]);

  if (error) return <div className="p-6 text-red-500">Failed to load campaign.</div>;
  if (!editingCampaign) return <div className="p-6 animate-pulse">Loading campaign details...</div>;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      const uploadData = new FormData();
      uploadData.append('coverImage', file);
      
      setIsUploading(true);
      const loadingToast = toast.loading('Uploading photo...');
      
      try {
        const response = await api.post('/cms/upload/campaign', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEditingCampaign({ 
          ...editingCampaign, 
          coverImage: [...editingCampaign.coverImage, response.data.data.url] 
        });
        toast.success('Photo uploaded!', { id: loadingToast });
      } catch (error) {
        console.error('Upload failed', error);
        toast.error('Failed to upload photo', { id: loadingToast });
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Video size must be less than 20MB');
        return;
      }
      
      const uploadData = new FormData();
      uploadData.append('video', file);
      
      setIsVideoUploading(true);
      const loadingToast = toast.loading('Uploading video...');
      
      try {
        const response = await api.post('/cms/upload/campaign-video', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEditingCampaign({ 
          ...editingCampaign, 
          videoUrl: response.data.data.url 
        });
        toast.success('Video uploaded!', { id: loadingToast });
      } catch (error) {
        console.error('Upload failed', error);
        toast.error('Failed to upload video', { id: loadingToast });
      } finally {
        setIsVideoUploading(false);
        e.target.value = '';
      }
    }
  };

  const removeVideo = async () => {
    if (!editingCampaign.videoUrl) return;
    
    const loadingToast = toast.loading('Removing video...');
    try {
      if (editingCampaign.videoUrl.startsWith('/uploads/campaigns/videos/')) {
        await api.delete('/cms/upload/campaign-video', { data: { fileUrl: editingCampaign.videoUrl } });
      }
      setEditingCampaign({...editingCampaign, videoUrl: ''});
      toast.success('Video removed', { id: loadingToast });
    } catch (error) {
      console.error('Failed to remove video', error);
      toast.error('Failed to remove video', { id: loadingToast });
    }
  };

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const loadingToast = toast.loading('Updating campaign...');
      const updateData = {
        title: editingCampaign.title,
        category: editingCampaign.category,
        target_amount: parseInt(editingCampaign.targetAmount),
        story: editingCampaign.story,
        video_url: editingCampaign.videoUrl || null,
        cover_image: editingCampaign.coverImage
      };
      
      await api.patch(`/campaigns/${editingCampaign.id}`, updateData);
      
      toast.success('Campaign updated successfully!', { id: loadingToast });
      mutate();
      navigate('/admin/campaigns');
    } catch (error) {
      console.error('Failed to update campaign', error);
      toast.error('Failed to update campaign');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/campaigns')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-charcoal/60" />
        </button>
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Edit Campaign
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Update campaign details and images
          </Typography>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        <form onSubmit={handleUpdateCampaign}>
          <div className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Campaign Title</label>
                <input 
                  type="text" 
                  value={editingCampaign.title} 
                  onChange={e => setEditingCampaign({...editingCampaign, title: e.target.value})} 
                  className="w-full px-4 py-2 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green bg-white" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Category</label>
                <select 
                  value={editingCampaign.category} 
                  onChange={e => setEditingCampaign({...editingCampaign, category: e.target.value})} 
                  className="w-full px-4 py-2 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green bg-white"
                  required
                >
                  <option value="Medical">Medical</option>
                  <option value="Education">Education</option>
                  <option value="Memorial">Memorial</option>
                  <option value="Disaster Relief">Disaster Relief</option>
                  <option value="Children">Children</option>
                  <option value="Animals">Animals</option>
                  <option value="Environment">Environment</option>
                  <option value="Emergencies">Emergencies</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Target Amount (₹)</label>
              <input 
                type="number" 
                value={editingCampaign.targetAmount} 
                onChange={e => setEditingCampaign({...editingCampaign, targetAmount: e.target.value})} 
                className="w-full px-4 py-2 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green bg-white" 
                required 
                min="1"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Campaign Images</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {editingCampaign.coverImage && editingCampaign.coverImage.map((img: string, idx: number) => (
                  <div key={idx} className="relative aspect-video">
                    <img src={getImageUrl(img)} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover border border-charcoal/10 rounded-xl bg-gray-50 p-1" />
                    <button 
                      type="button" 
                      onClick={async () => {
                        const newImages = [...editingCampaign.coverImage];
                        newImages.splice(idx, 1);
                        setEditingCampaign({...editingCampaign, coverImage: newImages});
                        if (img.startsWith('/uploads/campaigns/')) {
                          try {
                            await api.delete('/cms/upload/campaign', { data: { fileUrl: img } });
                          } catch (e) {
                            console.error('Failed to delete image', e);
                          }
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-charcoal/20 rounded-xl hover:bg-gray-50 hover:border-deep-green/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2 text-charcoal/60 group-hover:text-deep-green mb-1">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Image</span>
                  </div>
                  <span className="text-[10px] text-charcoal/40 mt-1">Up to 5MB</span>
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

            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-2">Campaign Video (Optional, max 20MB)</label>
              <div className="border border-charcoal/10 rounded-xl bg-white p-4">
                {editingCampaign.videoUrl ? (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                    {editingCampaign.videoUrl.startsWith('/uploads/') ? (
                      <video 
                        src={getImageUrl(editingCampaign.videoUrl)} 
                        controls 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-white text-sm">YouTube video linked.</div>
                    )}
                    <button 
                      type="button" 
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-md z-10"
                      title="Remove video"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-charcoal/20 rounded-lg hover:bg-gray-50 hover:border-deep-green/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 text-charcoal/60 group-hover:text-deep-green mb-1">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm font-medium">{isVideoUploading ? 'Uploading...' : 'Upload Video'}</span>
                    </div>
                    <span className="text-xs text-charcoal/40 mt-1">MP4, WEBM, OGG up to 20MB</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={handleVideoUpload}
                      disabled={isVideoUploading}
                    />
                  </label>
                )}
              </div>
            </div>
            
            {editingCampaign.documents && (
              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase mb-2">Submitted Documents (Internal Reference)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(() => {
                    let docs = [];
                    try {
                      docs = typeof editingCampaign.documents === 'string' ? JSON.parse(editingCampaign.documents) : editingCampaign.documents;
                    } catch (e) {
                      docs = [];
                    }
                    
                    if (!Array.isArray(docs) || docs.length === 0) {
                      return <p className="text-sm text-charcoal/50">No additional documents submitted.</p>;
                    }

                    return docs.map((docUrl: string, idx: number) => {
                      let label = 'Additional Document';
                      if (idx === 0) label = 'Beneficiary ID Proof';
                      else if (idx === 1) label = 'Supporting Documents';

                      const filename = docUrl.split('/').pop() || `Document_${idx + 1}`;
                      const ext = filename.split('.').pop()?.toLowerCase() || 'file';
                      
                      return (
                        <a 
                          key={idx}
                          href={docUrl.startsWith('http') ? docUrl : `${docUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 border border-charcoal/10 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                        >
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-deep-green truncate mb-0.5">{label}</p>
                            <p className="text-xs font-medium text-charcoal/80 truncate">{filename}</p>
                            <p className="text-[10px] text-charcoal/40 uppercase mt-0.5">{ext}</p>
                          </div>
                        </a>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Story</label>
              <textarea 
                value={editingCampaign.story} 
                onChange={e => setEditingCampaign({...editingCampaign, story: e.target.value})} 
                className="w-full p-4 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green h-64 resize-none bg-white" 
                required
              />
            </div>
          </div>
          
          <div className="p-6 border-t border-charcoal/5 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/campaigns')} disabled={isUploading}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isUploading}>Save Changes</Button>
          </div>
        </form>
      </div>

    </div>
  );
}
