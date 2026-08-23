import { useState } from 'react';
import { Typography } from '@/components/common/Typography';
import { MessageSquare, Calendar, Mail, Phone, ChevronDown, Trash2 } from 'lucide-react';
import useSWR from 'swr';
import { fetcher, api } from '@/lib/fetcher';
import toast from 'react-hot-toast';

interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'new' | 'in-progress' | 'resolved';
  created_at: string;
}

export function Enquiries() {
  const [filter, setFilter] = useState<string>('all');
  const { data, mutate } = useSWR('/enquiries', fetcher);
  
  const enquiries: Enquiry[] = data?.enquiries || [];

  const filteredEnquiries = enquiries.filter(enq => 
    filter === 'all' ? true : enq.status === filter
  );

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/enquiries/${id}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      mutate(); // refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await api.delete(`/enquiries/${id}`);
        toast.success('Enquiry deleted successfully');
        mutate();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete enquiry');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="text-2xl mb-1">Enquiries</Typography>
          <Typography variant="body" className="text-charcoal/60">
            Manage messages submitted through the public contact form.
          </Typography>
        </div>
        
        <div className="flex bg-white rounded-lg p-1 border border-charcoal/10 shadow-sm">
          {['all', 'new', 'in-progress', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === status 
                  ? 'bg-deep-green text-white shadow-sm' 
                  : 'text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
        {filteredEnquiries.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-deep-green/5 text-deep-green rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <Typography variant="h3" className="mb-2">No enquiries found</Typography>
            <p className="text-charcoal/60 max-w-md">
              There are no messages matching the current filter criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal/10">
            {filteredEnquiries.map((enquiry) => (
              <div key={enquiry.id} className="p-6 transition-colors hover:bg-charcoal/5">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Column: Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-charcoal">{enquiry.name}</h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-charcoal/70">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-deep-green" />
                            <a href={`mailto:${enquiry.email}`} className="hover:text-deep-green transition-colors">{enquiry.email}</a>
                          </div>
                          {enquiry.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-4 h-4 text-deep-green" />
                              <a href={`tel:${enquiry.phone}`} className="hover:text-deep-green transition-colors">{enquiry.phone}</a>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-deep-green" />
                            <span>{new Date(enquiry.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile Status Dropdown (visible only on small screens) */}
                      <div className="md:hidden">
                        <select
                          value={enquiry.status}
                          onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                          className={`text-sm rounded-full px-3 py-1 border outline-none font-medium appearance-none ${getStatusColor(enquiry.status)}`}
                        >
                          <option value="new">New</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(enquiry.id)}
                        className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors md:hidden"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 border border-charcoal/5">
                      <p className="text-charcoal/80 whitespace-pre-wrap">{enquiry.message}</p>
                    </div>
                  </div>
                  
                  {/* Right Column: Status Desktop */}
                  <div className="hidden md:flex flex-col items-end shrink-0 w-48">
                    <label className="text-xs font-bold text-charcoal/50 uppercase tracking-wider mb-2">Status</label>
                    <div className="relative">
                      <select
                        value={enquiry.status}
                        onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                        className={`appearance-none pl-4 pr-10 py-2 rounded-full border outline-none cursor-pointer font-medium transition-colors ${getStatusColor(enquiry.status)}`}
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50" />
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(enquiry.id)}
                      className="mt-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end"
                      title="Delete Enquiry"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
