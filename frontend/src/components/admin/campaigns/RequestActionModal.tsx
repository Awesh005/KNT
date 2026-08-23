import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
//
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { api } from '@/lib/fetcher';

interface RequestActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
  onActionComplete: () => void;
}

export function RequestActionModal({ isOpen, onClose, campaign, onActionComplete }: RequestActionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [remark, setRemark] = useState('');

  if (!campaign) return null;

  const handleAction = async (action: 'approved' | 'rejected' | 'needs_revision') => {
    setIsProcessing(true);
    try {
      await api.patch(`/requests/${campaign.id}/status`, { status: action, admin_remarks: remark });
      onActionComplete();
      onClose();
    } catch (error) {
      console.error('Failed to update request', error);
      toast.error('Failed to update request status.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-charcoal/5 flex justify-between items-center shrink-0">
              <Typography variant="h3" className="text-charcoal">Review Fundraiser Request</Typography>
              <button 
                onClick={onClose}
                className="p-2 text-charcoal/50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="space-y-6">
                
                {/* Basic Info */}
                <div>
                  <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-2">Campaign Beneficiary</h4>
                  <p className="text-lg font-bold text-charcoal">{campaign.beneficiary_name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-2">Requester</h4>
                    <p className="font-medium text-charcoal">{campaign.requester_name || 'Unknown'}</p>
                    <p className="text-sm text-charcoal/60">{campaign.requester_email || campaign.user_id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-2">Target Amount</h4>
                    <p className="font-bold text-deep-green text-xl">₹{Number(campaign.target_amount).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-2">Category</h4>
                  <span className="inline-flex bg-gray-100 text-charcoal/70 px-3 py-1 rounded-full text-sm font-bold">
                    {campaign.category}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-2">Story/Description</h4>
                  <div className="bg-gray-50 p-4 rounded-xl text-charcoal/70 text-sm whitespace-pre-wrap border border-charcoal/5">
                    {campaign.story}
                  </div>
                </div>

                {/* Bank Details */}
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-charcoal/5">
                  <div>
                    <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-2">Account Holder</h4>
                    <p className="font-medium text-charcoal">{campaign.account_holder_name || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-2">Account Number</h4>
                    <p className="font-bold text-charcoal">{campaign.account_number || 'N/A'}</p>
                  </div>
                </div>

                {/* Documents Placeholder */}
                <div>
                  <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-3">Submitted Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(() => {
                      let docs = [];
                      try {
                        docs = typeof campaign.documents === 'string' ? JSON.parse(campaign.documents) : campaign.documents;
                      } catch (e) {
                        docs = [];
                      }
                      
                      if (!Array.isArray(docs) || docs.length === 0) {
                        return <p className="text-sm text-charcoal/50">No documents submitted.</p>;
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
                            className="flex items-center gap-3 p-3 border border-charcoal/10 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <FileText className="w-6 h-6 text-goldenrod shrink-0" />
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

                {/* Admin Remarks */}
                <div>
                  <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-2">Admin Remarks (Optional)</h4>
                  <textarea 
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Add notes for internal reference or feedback to the user..."
                    className="w-full p-3 bg-white border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none text-sm text-charcoal resize-none h-24"
                  />
                </div>

              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-charcoal/5 bg-gray-50 shrink-0 flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => handleAction('needs_revision')}
                disabled={isProcessing}
                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Request Revision
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => handleAction('rejected')}
                  disabled={isProcessing}
                  className="text-red-500 border-red-500 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => handleAction('approved')}
                  isLoading={isProcessing}
                >
                  {!isProcessing && <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Approve & Publish
                </Button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
