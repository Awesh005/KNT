import { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { Typography } from '@/components/common/Typography';
import { RequestActionModal } from '@/components/admin/campaigns/RequestActionModal';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export function FundraiserRequests() {
  const { data, mutate } = useSWR('/requests?status=pending', fetcher);
  const requests: any[] = data?.requests || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReviewClick = (request: any) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleActionComplete = () => {
    mutate();
  };

  // Filter requests based on search
  const filteredRequests = requests.filter(req => 
    (req.beneficiary_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.requester_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Fundraiser Requests
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Review and approve user-submitted campaigns.
          </Typography>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-charcoal/5 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input 
              type="text" 
              placeholder="Search by beneficiary or requester..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-charcoal/10 rounded-xl text-sm font-bold text-charcoal/70 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-charcoal/60 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Beneficiary & Category</th>
                <th className="px-6 py-4">Requester</th>
                <th className="px-6 py-4">Target Amount</th>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-charcoal mb-1">{request.beneficiary_name}</div>
                    <span className="inline-flex bg-gray-100 text-charcoal/60 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {request.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-charcoal/80">
                    {request.requester_name || 'Unknown User'}
                    <div className="text-xs text-charcoal/40 mt-1">{request.requester_email || request.user_id}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-deep-green">
                    ₹{Number(request.target_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-charcoal/60">
                    {new Date(request.created_at || new Date()).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleReviewClick(request)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-deep-green text-white rounded-lg text-xs font-bold hover:bg-charcoal transition-colors shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex w-12 h-12 bg-gray-100 text-charcoal/30 rounded-full items-center justify-center mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-charcoal/50 font-medium">No pending requests found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RequestActionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedRequest}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
}
