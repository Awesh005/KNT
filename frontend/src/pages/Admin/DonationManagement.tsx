import { useState, useMemo } from 'react';
import { Search, Filter, Eye, Download, Trash2 } from 'lucide-react';
import type { Donation, Campaign } from '@/types';
//
import { Typography } from '@/components/common/Typography';
import { DonationVerificationModal } from '@/components/admin/donations/DonationVerificationModal';

import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';
import toast from 'react-hot-toast';

export function DonationManagement() {
  const { data: donationsData, mutate: mutateDonations } = useSWR('/donations', fetcher);
  const donations: Donation[] = donationsData?.donations || [];
  
  const { data: campaignsData } = useSWR('/campaigns?limit=100', fetcher);
  const campaigns: Campaign[] = campaignsData?.campaigns || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal state
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteDonation = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this donation? This action cannot be undone and will remove associated files.')) return;
    try {
      await api.delete(`/donations/${id}`);
      toast.success('Donation deleted successfully');
      mutateDonations();
    } catch (error) {
      toast.error('Failed to delete donation');
    }
  };

  const handleReviewClick = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  const handleActionComplete = () => {
    mutateDonations();
  };

  // Filter donations
  const filteredDonations = useMemo(() => {
    return donations.filter(d => {
      const matchesSearch = 
        (d.donorName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (d.paymentRef || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [donations, searchTerm, statusFilter]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleExportCSV = () => {
    if (!donations || donations.length === 0) {
      toast.error('No donations available to export');
      return;
    }

    const headers = ['Donation ID', 'Donor Name', 'Campaign Title', 'Amount (INR)', 'Payment Ref', 'Date', 'Status'];
    const rows = filteredDonations.map((d: Donation) => {
      const campaign = campaigns.find((c: Campaign) => c.id === d.campaignId);
      return [
        d.id,
        `"${(d.donorName || 'Anonymous').replace(/"/g, '""')}"`,
        `"${(campaign?.title || 'General').replace(/"/g, '""')}"`,
        d.amount,
        `"${(d.paymentRef || 'N/A').replace(/"/g, '""')}"`,
        `"${new Date(d.donatedAt).toLocaleDateString('en-IN')}"`,
        d.status
      ];
    });

    const csvString = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `donations_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Donations report exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Donation Management
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Verify manual payments and view all platform donations.
          </Typography>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl text-sm font-bold hover:bg-charcoal/90 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-charcoal/5 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/50">
          
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input 
              type="text" 
              placeholder="Search by donor name or reference ID..." 
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
              <option value="pending">Pending Verification</option>
              <option value="verified">Verified</option>
              <option value="failed">Failed / Rejected</option>
            </select>
            
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-charcoal/10 rounded-xl text-sm font-bold text-charcoal/70 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-charcoal/60 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Donor Details</th>
                <th className="px-6 py-4">Campaign</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date & Ref</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {filteredDonations.map((donation) => {
                const campaign = campaigns.find(c => c.id === donation.campaignId);
                
                return (
                  <tr key={donation.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-charcoal">{donation.donorName || 'Anonymous'}</div>
                      {donation.donorId && (
                        <div className="text-[10px] text-charcoal/40 font-mono mt-0.5">{donation.donorId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-charcoal/80 max-w-[200px] truncate" title={campaign?.title}>
                        {campaign?.title || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-deep-green text-base">₹{Number(donation.amount).toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-charcoal/70 mb-0.5">
                        {new Date(donation.donatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-charcoal/40 font-mono">Ref: {donation.paymentRef || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusClass(donation.status)}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {donation.status === 'pending' ? (
                          <button 
                            onClick={() => handleReviewClick(donation)}
                            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold hover:bg-yellow-200 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Verify
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleReviewClick(donation)}
                            className="p-1.5 text-charcoal/40 hover:text-deep-green hover:bg-gray-100 rounded-lg transition-colors inline-block"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          title="Delete Donation"
                          onClick={() => handleDeleteDonation(donation.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredDonations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex w-12 h-12 bg-gray-100 text-charcoal/30 rounded-full items-center justify-center mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-charcoal/50 font-medium">No donations found matching criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DonationVerificationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        donation={selectedDonation}
        campaign={campaigns.find(c => c.id === selectedDonation?.campaignId) || null}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
}
