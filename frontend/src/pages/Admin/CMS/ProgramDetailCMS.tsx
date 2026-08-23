import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/utils/getImageUrl';

export function ProgramDetailCMS() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, mutate, isLoading } = useSWR('/cms/global/programs', fetcher);
  
  const [formData, setFormData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (data?.content) {
      const program = data.content.find((p: any) => p.id === Number(id));
      if (program) {
        setFormData({
          ...program,
          sdgTags: Array.isArray(program.sdgTags) ? program.sdgTags.join(', ') : (program.sdgTags || ''),
          detail: {
            ...program.detail,
            objectivesStr: program.detail?.objectives?.join('\n') || '',
            budgetAreasStr: program.detail?.budgetAreas?.join('\n') || '',
            keyFocusAreasStr: program.detail?.keyFocusAreas?.join('\n') || '',
            expectedImpactStr: program.detail?.expectedImpact?.join('\n') || '',
            implementationPlanStr: program.detail?.implementationPlan?.join('\n') || ''
          }
        });
      }
    }
  }, [data, id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      setIsUploading(true);
      const res = await api.post('/cms/upload/program', formDataUpload, {
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
        await api.delete('/cms/upload/program', { data: { fileUrl: formData.image } });
      }
      setFormData({ ...formData, image: '' });
      toast.success('Image removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    const newPrograms = data.content.map((p: any) => {
      if (p.id === Number(id)) {
        return {
          ...formData,
          sdgTags: String(formData.sdgTags || '').split(',').map((s: string) => s.trim()).filter(Boolean),
          detail: {
            quote: formData.detail.quote,
            introduction: formData.detail.introduction,
            futureVision: formData.detail.futureVision,
            objectives: formData.detail.objectivesStr.split('\n').map((s: string) => s.trim()).filter(Boolean),
            budgetAreas: formData.detail.budgetAreasStr.split('\n').map((s: string) => s.trim()).filter(Boolean),
            keyFocusAreas: formData.detail.keyFocusAreasStr.split('\n').map((s: string) => s.trim()).filter(Boolean),
            expectedImpact: formData.detail.expectedImpactStr.split('\n').map((s: string) => s.trim()).filter(Boolean),
            implementationPlan: formData.detail.implementationPlanStr.split('\n').map((s: string) => s.trim()).filter(Boolean),
          }
        };
      }
      return p;
    });

    try {
      mutate({ content: newPrograms }, false);
      await api.put('/cms/global/programs', { content: newPrograms });
      toast.success('Program updated successfully');
      mutate();
      navigate('/admin/cms/programs');
    } catch (error) {
      console.error('Failed to update program', error);
      toast.error('Failed to update program');
      mutate();
    }
  };

  if (isLoading || !formData) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/cms/programs')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-charcoal/60" />
          </button>
          <div>
            <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
              Edit Program: {formData.title}
            </Typography>
            <Typography variant="body" className="text-charcoal/60 text-sm">
              Manage all details, introduction, and impact points for this program.
            </Typography>
          </div>
        </div>
        <Button onClick={handleSave} className="bg-goldenrod hover:bg-yellow-600 text-white">
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
          <Typography variant="h3" className="!text-lg text-deep-green border-b border-charcoal/5 pb-2">Basic Information</Typography>
          
          <div>
            <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Title</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Program Image</label>
              <div className="flex items-center gap-4">
                {formData.image && (
                  <div className="relative group">
                    <img src={getImageUrl(formData.image)} alt="Program" className="w-12 h-12 object-cover rounded-lg border border-charcoal/10" />
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      disabled={isUploading}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
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
            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Icon</label>
              <select 
                value={formData.icon} 
                onChange={e => setFormData({...formData, icon: e.target.value})} 
                className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green bg-white"
              >
                <option value="graduation-cap">Graduation Cap</option>
                <option value="sprout">Sprout</option>
                <option value="baby">Baby</option>
                <option value="users">Users</option>
                <option value="hospital">Hospital</option>
                <option value="book-open">Book Open</option>
                <option value="wrench">Wrench</option>
                <option value="heart-handshake">Heart Handshake</option>
                <option value="tractor">Tractor</option>
                <option value="flower2">Flower</option>
                <option value="droplet">Droplet</option>
                <option value="home">Home</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">SDG tags (comma-separated codes, e.g. 3, 4)</label>
            <input type="text" value={formData.sdgTags || ''} onChange={e => setFormData({...formData, sdgTags: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
          </div>
          <div>
            <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Short Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green h-20 resize-none" />
          </div>
        </div>

        {/* Introduction & Vision */}
        <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
          <Typography variant="h3" className="!text-lg text-deep-green border-b border-charcoal/5 pb-2">Introduction & Vision</Typography>
          
          <div>
            <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Inspirational Quote</label>
            <input type="text" value={formData.detail.quote} onChange={e => setFormData({...formData, detail: { ...formData.detail, quote: e.target.value }})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
          </div>
          <div>
            <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Project Introduction</label>
            <textarea value={formData.detail.introduction} onChange={e => setFormData({...formData, detail: { ...formData.detail, introduction: e.target.value }})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green h-32 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Future Vision</label>
            <textarea value={formData.detail.futureVision} onChange={e => setFormData({...formData, detail: { ...formData.detail, futureVision: e.target.value }})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green h-24 resize-none" />
          </div>
        </div>

        {/* Arrays Section */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
          <Typography variant="h3" className="!text-lg text-deep-green border-b border-charcoal/5 pb-2">Detailed Points (Enter one item per line)</Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Key Focus Areas</label>
              <textarea placeholder="e.g. Community Engagement" value={formData.detail.keyFocusAreasStr} onChange={e => setFormData({...formData, detail: { ...formData.detail, keyFocusAreasStr: e.target.value }})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green h-40 resize-none text-sm" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Objectives</label>
              <textarea placeholder="e.g. To create a scalable service..." value={formData.detail.objectivesStr} onChange={e => setFormData({...formData, detail: { ...formData.detail, objectivesStr: e.target.value }})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green h-40 resize-none text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Implementation Plan</label>
              <textarea placeholder="e.g. Survey the target area..." value={formData.detail.implementationPlanStr} onChange={e => setFormData({...formData, detail: { ...formData.detail, implementationPlanStr: e.target.value }})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green h-40 resize-none text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Budget & Investment Areas</label>
              <textarea placeholder="e.g. Infrastructure Development..." value={formData.detail.budgetAreasStr} onChange={e => setFormData({...formData, detail: { ...formData.detail, budgetAreasStr: e.target.value }})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green h-40 resize-none text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Expected Impact</label>
              <textarea placeholder="e.g. Direct measurable support..." value={formData.detail.expectedImpactStr} onChange={e => setFormData({...formData, detail: { ...formData.detail, expectedImpactStr: e.target.value }})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green h-40 resize-none text-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
