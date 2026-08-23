import { useState } from 'react';
import { Search, Filter, Edit2, Trash2, CheckCircle, XCircle, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { Campaign } from '@/types';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { fetcher, api } from '@/lib/fetcher';
import { Typography } from '@/components/common/Typography';

export function CampaignManagement() {
  const { data, mutate } = useSWR('/campaigns?limit=100', fetcher);
  const campaigns: Campaign[] = data?.campaigns || [];
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const formatCampaignId = (id: string | number) => {
    const num = typeof id === 'string' ? parseInt(id.replace(/\D/g, '') || '0') : id;
    return `CMP-${String(num).padStart(3, '0')}`;
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'closed' : 'approved';
    try {
      mutate({ campaigns: campaigns.map(c => c.id === id ? { ...c, status: newStatus as any } : c) }, false);
      await api.patch(`/campaigns/${id}`, { status: newStatus });
      mutate();
    } catch (error) {
      console.error('Failed to update status', error);
      mutate();
    }
  };

  const handleToggleFlag = async (id: string, flag: 'is_urgent' | 'is_featured') => {
    const campaign: any = campaigns.find(c => c.id === id);
    if (!campaign) return;
    
    const camelFlag = flag === 'is_urgent' ? 'isUrgent' : 'isFeatured';
    const currentValue = campaign[flag] ?? campaign[camelFlag];
    
    try {
      mutate({ campaigns: campaigns.map((c: any) => c.id === id ? { ...c, [flag]: !currentValue, [camelFlag]: !currentValue } : c) }, false);
      await api.patch(`/campaigns/${id}`, { [flag]: !currentValue });
      mutate();
    } catch (error) {
      console.error('Failed to update flag', error);
      mutate();
    }
  };

  const handleDeleteCampaign = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        const loadingToast = toast.loading('Deleting campaign...');
        
        const campaignToDelete: any = campaigns.find(c => c.id === id);
        if (campaignToDelete) {
          const images = campaignToDelete.cover_image || campaignToDelete.coverImage;
          const imageArray = Array.isArray(images) ? images : (images ? [images] : []);
          
          for (const img of imageArray) {
            if (typeof img === 'string' && img.startsWith('/uploads/')) {
              try {
                await api.delete('/cms/upload/campaign', { data: { fileUrl: img } });
              } catch (e) {
                console.error('Failed to delete physical image file', e);
              }
            }
          }
        }
        
        await api.delete(`/campaigns/${id}`);
        mutate({ campaigns: campaigns.filter(c => c.id !== id) }, false);
        toast.success('Campaign deleted successfully', { id: loadingToast });
        mutate();
      } catch (error) {
        console.error('Failed to delete campaign', error);
        toast.error('Failed to delete campaign');
        mutate();
      }
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Campaign Management
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            View and manage all fundraising campaigns.
          </Typography>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-charcoal/5 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/50">
          
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input 
              type="text" 
              placeholder="Search campaigns by title or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-charcoal/10 rounded-xl text-sm text-charcoal/70 outline-none focus:ring-2 focus:ring-deep-green"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-charcoal/10 rounded-xl text-sm font-bold text-charcoal/70 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-charcoal/60 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">ID & Title</th>
                <th className="px-6 py-4">Raised / Target</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-charcoal mb-1 max-w-[250px] truncate" title={campaign.title}>
                      {campaign.title}
                    </div>
                    <div className="text-xs text-charcoal/40 font-mono">{formatCampaignId(campaign.id)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-deep-green">₹{((campaign as any).raised_amount ?? campaign.raisedAmount ?? 0).toLocaleString()}</div>
                    <div className="text-xs text-charcoal/50">of ₹{((campaign as any).target_amount ?? campaign.targetAmount ?? 0).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusClass(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-charcoal/60">
                    {new Date((campaign as any).created_at || campaign.createdAt || new Date()).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        title={((campaign as any).is_featured || campaign.isFeatured) ? 'Remove from Featured' : 'Mark as Featured'}
                        onClick={() => handleToggleFlag(campaign.id, 'is_featured')}
                        className={`p-1.5 rounded-lg transition-colors border ${
                          ((campaign as any).is_featured || campaign.isFeatured) 
                            ? 'text-goldenrod bg-goldenrod/10 border-goldenrod/20' 
                            : 'text-charcoal/30 hover:text-goldenrod hover:bg-gray-100 border-transparent'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </button>
                      <button 
                        title={((campaign as any).is_urgent || campaign.isUrgent) ? 'Remove from Urgent' : 'Mark as Urgent'}
                        onClick={() => handleToggleFlag(campaign.id, 'is_urgent')}
                        className={`p-1.5 rounded-lg transition-colors border ${
                          ((campaign as any).is_urgent || campaign.isUrgent) 
                            ? 'text-red-500 bg-red-50 border-red-200' 
                            : 'text-charcoal/30 hover:text-red-500 hover:bg-gray-100 border-transparent'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </button>
                      
                      <div className="w-px h-6 bg-charcoal/10 mx-1" />

                      <button 
                        title={campaign.status === 'approved' ? 'Close Campaign' : 'Re-open Campaign'}
                        onClick={() => handleStatusToggle(campaign.id, campaign.status)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          campaign.status === 'approved' 
                            ? 'text-yellow-600 hover:bg-yellow-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        disabled={campaign.status === 'pending' || campaign.status === 'rejected'}
                      >
                        {campaign.status === 'approved' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button 
                        title="Project dossier (people, money, photos, location)"
                        onClick={() => navigate(`/admin/campaigns/${campaign.id}/manage`)}
                        className="p-1.5 text-deep-green hover:bg-light-green rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                      </button>
                      <button 
                        title="Edit Campaign"
                        onClick={() => navigate(`/admin/campaigns/${campaign.id}/edit`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        title="Delete Campaign"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex w-12 h-12 bg-gray-100 text-charcoal/30 rounded-full items-center justify-center mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-charcoal/50 font-medium">No campaigns match your search criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
