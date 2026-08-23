import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, Upload, User } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { getImageUrl } from '@/utils/getImageUrl';
import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';
import type { TeamMember } from '@/stores/leadershipStore';

const DEFAULT_FOUNDER = {
  badge: "Founder's Message",
  name: '',
  role: '',
  heading: 'Guiding Light of Our Mission',
  imageUrl: '/Founder.jpeg',
  signatureUrl: '/signature.png',
  paragraphs: [
    'At KNT World Welfare Foundation, our mission is to create meaningful change by empowering lives and building a compassionate, self-reliant, and sustainable society. We believe that true development comes when education, health, spiritual growth, and environmental care move hand in hand for the upliftment of every individual.',
    'Through our projects, we are not just building institutions, we are nurturing hope, dignity, and opportunities for a better tomorrow. Together, let us serve humanity and build a brighter, more equitable world for all.',
  ],
};

const DEFAULT_COFOUNDER = {
  badge: "Co-Founder's Message",
  name: 'Vikram Kumar',
  role: 'Co-Founder',
  heading: 'Together We Serve Humanity',
  imageUrl: '/CoFounder.png',
  signatureUrl: '',
  paragraphs: [
    'KNT World Welfare Foundation was built on a simple belief — that every person deserves dignity, opportunity, and a fair chance to grow. As Co-Founder, I work to turn this belief into daily action through education, health, and community programmes that reach those who need us most.',
    'Our strength is not only in projects, but in people who walk with us. With discipline, compassion, and shared responsibility, we will keep building a foundation that serves for generations.',
  ],
};

export function LeadershipCMS() {
  const { data, mutate } = useSWR('/cms/global/team', fetcher);
  const { data: founderData, mutate: mutateFounder } = useSWR('/cms/global/founder', fetcher);
  const { data: cofounderData, mutate: mutateCofounder } = useSWR('/cms/global/cofounder', fetcher);
  const members: TeamMember[] = data?.content || [];
  const [founder, setFounder] = useState(DEFAULT_FOUNDER);
  const [cofounder, setCofounder] = useState(DEFAULT_COFOUNDER);

  useEffect(() => {
    if (founderData?.content) {
      setFounder({ ...DEFAULT_FOUNDER, ...founderData.content });
    }
  }, [founderData]);

  useEffect(() => {
    if (cofounderData?.content) {
      setCofounder({ ...DEFAULT_COFOUNDER, ...cofounderData.content });
    }
  }, [cofounderData]);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', bio: '', imageUrl: '' });

  const handleOpenModal = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({ name: member.name, role: member.role, bio: member.bio, imageUrl: member.imageUrl });
    } else {
      setEditingMember(null);
      setFormData({ name: '', role: '', bio: '', imageUrl: '' });
    }
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
      uploadData.append('photo', file);
      
      setIsUploading(true);
      const loadingToast = toast.loading('Uploading photo...');
      
      try {
        const response = await api.post('/cms/upload/team', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFormData({ ...formData, imageUrl: response.data.data.url });
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

  const saveToBackend = async (newMembers: TeamMember[]) => {
    try {
      mutate({ content: newMembers }, false);
      await api.put('/cms/global/team', { content: newMembers });
      mutate();
    } catch (error) {
      console.error('Failed to update team members', error);
      mutate();
    }
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('Please enter a name');
      return;
    }
    if (!formData.role) {
      toast.error('Please enter a role');
      return;
    }

    let newMembers = [...members];
    if (editingMember) {
      const index = newMembers.findIndex(m => m.id === editingMember.id);
      if (index !== -1) {
        newMembers[index] = { ...editingMember, ...formData };
      }
    } else {
      const newMember: TeamMember = {
        id: `MEMBER-${Date.now()}`,
        ...formData
      };
      newMembers.push(newMember);
    }
    
    saveToBackend(newMembers);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      const memberToDelete = members.find(m => m.id === id);
      const newMembers = members.filter(m => m.id !== id);
      
      await saveToBackend(newMembers);
      
      if (memberToDelete && memberToDelete.imageUrl && memberToDelete.imageUrl.startsWith('/uploads/')) {
        try {
          await api.delete('/cms/upload/team', { data: { fileUrl: memberToDelete.imageUrl } });
        } catch (error) {
          console.error('Failed to delete physical file', error);
        }
      }
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLeaderImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'imageUrl' | 'signatureUrl',
    kind: 'founder' | 'cofounder'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('photo', file);
    try {
      const response = await api.post('/cms/upload/team', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = response.data.data.url;
      if (kind === 'founder') setFounder({ ...founder, [field]: url });
      else setCofounder({ ...cofounder, [field]: url });
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  const saveFounder = async () => {
    try {
      mutateFounder({ content: founder }, false);
      await api.put('/cms/global/founder', { content: founder });
      toast.success('Founder block saved');
      mutateFounder();
    } catch {
      toast.error('Failed to save founder block');
      mutateFounder();
    }
  };

  const saveCofounder = async () => {
    try {
      mutateCofounder({ content: cofounder }, false);
      await api.put('/cms/global/cofounder', { content: cofounder });
      toast.success('Co-founder block saved');
      mutateCofounder();
    } catch {
      toast.error('Failed to save co-founder block');
      mutateCofounder();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Typography variant="h3">Founder Block</Typography>
          <Button onClick={saveFounder} className="bg-goldenrod hover:bg-yellow-600 text-white">Save Founder</Button>
        </div>
        <input value={founder.badge} onChange={(e) => setFounder({ ...founder, badge: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-charcoal/20" placeholder="Badge label" />
        <input value={founder.heading} onChange={(e) => setFounder({ ...founder, heading: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-charcoal/20" placeholder="Heading" />
        {founder.paragraphs.map((paragraph: string, index: number) => (
          <textarea key={index} value={paragraph} onChange={(e) => {
            const paragraphs = [...founder.paragraphs];
            paragraphs[index] = e.target.value;
            setFounder({ ...founder, paragraphs });
          }} className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-charcoal/20" />
        ))}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Founder photo</label>
            <input type="file" accept="image/*" onChange={(e) => handleLeaderImageUpload(e, 'imageUrl', 'founder')} />
            {founder.imageUrl && <img src={getImageUrl(founder.imageUrl)} alt="Founder" className="mt-2 w-32 h-40 object-cover rounded-xl" />}
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Signature image</label>
            <input type="file" accept="image/*" onChange={(e) => handleLeaderImageUpload(e, 'signatureUrl', 'founder')} />
            {founder.signatureUrl && <img src={getImageUrl(founder.signatureUrl)} alt="Signature" className="mt-2 h-16 object-contain" />}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Typography variant="h3">Co-Founder Block</Typography>
          <Button onClick={saveCofounder} className="bg-goldenrod hover:bg-yellow-600 text-white">Save Co-Founder</Button>
        </div>
        <input value={cofounder.name} onChange={(e) => setCofounder({ ...cofounder, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-charcoal/20" placeholder="Name" />
        <input value={cofounder.role} onChange={(e) => setCofounder({ ...cofounder, role: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-charcoal/20" placeholder="Role" />
        <input value={cofounder.badge} onChange={(e) => setCofounder({ ...cofounder, badge: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-charcoal/20" placeholder="Badge label" />
        <input value={cofounder.heading} onChange={(e) => setCofounder({ ...cofounder, heading: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-charcoal/20" placeholder="Heading" />
        {cofounder.paragraphs.map((paragraph: string, index: number) => (
          <textarea key={index} value={paragraph} onChange={(e) => {
            const paragraphs = [...cofounder.paragraphs];
            paragraphs[index] = e.target.value;
            setCofounder({ ...cofounder, paragraphs });
          }} className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-charcoal/20" />
        ))}
        <div>
          <label className="block text-sm font-bold mb-2">Co-founder photo</label>
          <input type="file" accept="image/*" onChange={(e) => handleLeaderImageUpload(e, 'imageUrl', 'cofounder')} />
          {cofounder.imageUrl && <img src={getImageUrl(cofounder.imageUrl)} alt="Co-Founder" className="mt-2 w-32 h-40 object-cover rounded-xl" />}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Leadership CMS
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Manage Core Team members displayed on the Leadership page.
          </Typography>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-goldenrod hover:bg-yellow-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Team Member
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        <div className="p-4 border-b border-charcoal/5 flex bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input 
              type="text" 
              placeholder="Search members by name or role..." 
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
                <th className="px-6 py-4">Profile</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 w-1/3">Bio</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    {member.imageUrl ? (
                      <img src={getImageUrl(member.imageUrl)} alt={member.name} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-charcoal/30 border border-charcoal/10">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-charcoal">{member.name}</td>
                  <td className="px-6 py-4 text-charcoal/70">{member.role}</td>
                  <td className="px-6 py-4 text-charcoal/60 line-clamp-2" title={member.bio}>
                    {member.bio}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenModal(member)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-charcoal/50">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-charcoal/5 flex justify-between items-center">
              <Typography variant="h3">{editingMember ? 'Edit Member' : 'Add Member'}</Typography>
              <button onClick={() => setIsModalOpen(false)} className="text-charcoal/50 hover:text-charcoal"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Role</label>
                  <input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-2">Member Image</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {formData.imageUrl && (
                      <div className="relative shrink-0">
                        <img src={getImageUrl(formData.imageUrl)} alt="Preview" className="w-20 h-20 object-cover border border-charcoal/10 rounded-xl bg-gray-50 p-1" />
                        <button 
                          type="button" 
                          onClick={async () => {
                            const currentUrl = formData.imageUrl;
                            setFormData({...formData, imageUrl: ''});
                            if (currentUrl.startsWith('/uploads/')) {
                              try {
                                await api.delete('/cms/upload/team', { data: { fileUrl: currentUrl } });
                              } catch (e) {
                                console.error('Failed to delete image', e);
                              }
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                          title="Remove image"
                        >
                          <Plus className="w-4 h-4 rotate-45" />
                        </button>
                      </div>
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
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Bio</label>
                  <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green h-24 resize-none" />
                </div>
              </div>
              <div className="p-6 border-t border-charcoal/5 bg-gray-50 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isUploading}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={isUploading}>Save Member</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
