import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, Link as LinkIcon, Upload } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
//

import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';

// Define partner type locally since it might not be in global types yet
interface Partner {
  id: string;
  name: string;
  category: 'Sponsors' | 'Hospitals' | 'NGOs';
  logoUrl: string;
  website?: string;
  location?: string;
}

export function PartnersCMS() {
  const { data, mutate } = useSWR('/cms/global/partners', fetcher);
  const rawData = data?.content || {};
  let partners: Partner[] = [];
  if (Array.isArray(rawData)) {
    partners = rawData;
  } else {
    const sponsors = (rawData.sponsors || []).map((p: any) => ({ id: p.id, name: p.name, logoUrl: p.logo, website: p.link, location: p.location, category: 'Sponsors' }));
    const hospitals = (rawData.hospitals || []).map((p: any) => ({ id: p.id, name: p.name, logoUrl: p.image, website: p.link, location: p.location, category: 'Hospitals' }));
    const ngos = (rawData.ngos || []).map((p: any) => ({ id: p.id, name: p.name, logoUrl: p.image, website: p.link, location: p.location, category: 'NGOs' }));
    partners = [...sponsors, ...hospitals, ...ngos] as Partner[];
  }
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'Sponsors' | 'Hospitals' | 'NGOs'>('Sponsors');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<{name: string, category: 'Sponsors' | 'Hospitals' | 'NGOs', logoUrl: string, website: string, location: string}>({ 
    name: '', category: 'Sponsors', logoUrl: '', website: '', location: '' 
  });

  const handleOpenModal = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({ name: partner.name, category: partner.category, logoUrl: partner.logoUrl, website: partner.website || '', location: partner.location || '' });
    } else {
      setEditingPartner(null);
      setFormData({ name: '', category: activeTab, logoUrl: '', website: '', location: '' });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveToBackend = async (newPartners: Partner[]) => {
    const newContent = {
       sponsors: newPartners.filter(p => p.category === 'Sponsors').map(p => ({ id: p.id, name: p.name, logo: p.logoUrl, link: p.website, location: p.location })),
       hospitals: newPartners.filter(p => p.category === 'Hospitals').map(p => ({ id: p.id, name: p.name, image: p.logoUrl, link: p.website, location: p.location })),
       ngos: newPartners.filter(p => p.category === 'NGOs').map(p => ({ id: p.id, name: p.name, image: p.logoUrl, link: p.website, location: p.location })),
    };
    try {
      mutate({ ...data, content: newContent }, false);
      await api.put('/cms/global/partners', { content: newContent });
      mutate();
      toast.success('Partners updated successfully!');
    } catch (error) {
      console.error('Failed to update partners', error);
      toast.error('Failed to update partners. Please try again.');
      mutate();
    }
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('Please enter a partner name');
      return;
    }
    if (!formData.logoUrl) {
      toast.error('Please upload a partner logo');
      return;
    }

    let newPartners = [...partners];
    if (editingPartner) {
      const index = newPartners.findIndex(p => p.id === editingPartner.id);
      if (index !== -1) {
        newPartners[index] = { ...editingPartner, ...formData };
      }
    } else {
      const newPartner: Partner = {
        id: `PARTNER-${Date.now()}`,
        ...formData
      };
      newPartners.push(newPartner);
    }
    
    saveToBackend(newPartners);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this partner?')) {
      const newPartners = partners.filter(p => p.id !== id);
      saveToBackend(newPartners);
    }
  };

  const filteredPartners = partners.filter(p => 
    (p.category === activeTab) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const ensureAbsoluteUrl = (url: string) => {
    if (!url) return '#';
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Partners CMS
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Manage organizational partners across different categories.
          </Typography>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-goldenrod hover:bg-yellow-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Partner
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        <div className="border-b border-charcoal/5 bg-gray-50/30 overflow-x-auto">
          <nav className="flex gap-6 px-4" aria-label="Tabs">
            {[
              { id: 'Sponsors', label: 'Sponsors' },
              { id: 'Hospitals', label: 'Hospitals' },
              { id: 'NGOs', label: 'NGOs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-deep-green text-deep-green'
                    : 'border-transparent text-charcoal/50 hover:text-charcoal/80 hover:border-charcoal/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-b border-charcoal/5 flex bg-white">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input 
              type="text" 
              placeholder="Search partners..." 
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
                <th className="px-6 py-4">Logo</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Website</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {filteredPartners.map((partner, index) => (
                <tr key={`${partner.id}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-16 h-12 bg-white border border-charcoal/10 rounded-lg p-2 flex items-center justify-center">
                      <img src={partner.logoUrl} alt={partner.name} className="max-w-full max-h-full object-contain" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-charcoal">{partner.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-charcoal/60 px-2 py-1 rounded-md text-xs">{partner.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    {partner.website ? (
                      <a href={ensureAbsoluteUrl(partner.website)} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" /> Link
                      </a>
                    ) : (
                      <span className="text-charcoal/30">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenModal(partner)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(partner.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPartners.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-charcoal/50">No partners found.</td>
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
              <Typography variant="h3">{editingPartner ? 'Edit Partner' : 'Add Partner'}</Typography>
              <button onClick={() => setIsModalOpen(false)} className="text-charcoal/50 hover:text-charcoal"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSave(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
            >
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Category</label>
                  <div className="w-full p-2 border border-charcoal/10 rounded-lg bg-gray-50 text-charcoal font-medium">
                    {formData.category}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-2">Partner Logo</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {formData.logoUrl && (
                      <img src={formData.logoUrl} alt="Logo preview" className="w-20 h-20 object-contain border border-charcoal/10 rounded-xl bg-gray-50 p-2 shrink-0" />
                    )}
                    <label className="flex flex-col items-center justify-center flex-1 w-full h-20 border-2 border-charcoal/15 border-dashed rounded-xl cursor-pointer bg-white hover:bg-charcoal/5 transition-colors group">
                      <div className="flex items-center gap-2 text-charcoal/70 group-hover:text-deep-green transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">Click to upload Image</span>
                      </div>
                      <span className="text-xs text-charcoal/40 mt-1">PNG, JPG, SVG up to 2MB</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
                {(formData.category === 'Hospitals' || formData.category === 'NGOs') && (
                  <div>
                    <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Location (Optional)</label>
                    <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" placeholder="e.g. Ranchi" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Website URL (Optional)</label>
                  <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full p-2 border border-charcoal/10 rounded-lg outline-none focus:border-deep-green" />
                </div>
              </div>
              <div className="p-6 border-t border-charcoal/5 bg-gray-50 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Partner</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
