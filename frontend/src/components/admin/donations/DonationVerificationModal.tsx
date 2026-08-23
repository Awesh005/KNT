import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, FileImage, User } from 'lucide-react';
import type { Donation, Campaign } from '@/types';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
//

interface DonationVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation | null;
  campaign: Campaign | null;
  onActionComplete: () => void;
}

import { api } from '@/lib/fetcher';

export function DonationVerificationModal({ 
  isOpen, 
  onClose, 
  donation, 
  campaign,
  onActionComplete 
}: DonationVerificationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [remark, setRemark] = useState('');
  const [utr, setUtr] = useState('');

  useEffect(() => {
    if (donation) {
      setUtr(donation.paymentRef || '');
    }
  }, [donation]);

  if (!donation) return null;

  const handleAction = async (action: 'verified' | 'failed') => {
    setIsProcessing(true);
    
    try {
      await api.patch(`/donations/${donation.id}/verify`, { status: action, paymentRef: utr });
      onActionComplete();
      onClose();
    } catch (error) {
      console.error('Failed to verify donation', error);
      toast.error('Failed to update donation status.');
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-charcoal/5 flex justify-between items-center shrink-0">
              <Typography variant="h3" className="text-charcoal">Verify Manual Donation</Typography>
              <button 
                onClick={onClose}
                className="p-2 text-charcoal/50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row">
              {/* Left Column: Details */}
              <div className="p-6 md:w-1/2 space-y-6 border-b md:border-b-0 md:border-r border-charcoal/5">
                
                <div>
                  <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-2">Donation Amount</h4>
                  <p className="text-3xl font-bold text-deep-green">₹{Number(donation.amount).toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-2">Donor Details</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-charcoal/40">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal">{donation.donorName || 'Anonymous'}</p>
                      {donation.donorId ? (
                        <p className="text-xs text-charcoal/50">User ID: {donation.donorId}</p>
                      ) : (
                        <p className="text-xs text-charcoal/50">Guest Donor</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-2">Campaign Supported</h4>
                  <p className="font-medium text-charcoal">{campaign?.title || 'Unknown Campaign'}</p>
                  <p className="text-xs text-charcoal/50 mt-1">ID: {donation.campaignId}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-2">Transaction Details</h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-charcoal/5 space-y-2 text-sm">
                    <div className="flex flex-col gap-1 mb-2">
                      <span className="text-charcoal/60">Reference / UTR:</span>
                      <input 
                        value={utr}
                        onChange={(e) => setUtr(e.target.value)}
                        placeholder="Enter UTR from screenshot"
                        className="p-2 border border-charcoal/10 rounded-lg text-sm focus:ring-2 focus:ring-deep-green outline-none font-bold text-charcoal w-full"
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Date:</span>
                      <span className="font-bold text-charcoal">
                        {new Date(donation.donatedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Status:</span>
                      <span className="font-bold capitalize text-yellow-600">{donation.status}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-2">Admin Note (Rejection Reason)</h4>
                  <textarea 
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="If rejecting, please state the reason..."
                    className="w-full p-3 bg-white border border-charcoal/10 rounded-xl focus:ring-2 focus:ring-deep-green focus:border-transparent outline-none text-sm text-charcoal resize-none h-20"
                  />
                </div>
              </div>

              {/* Right Column: Screenshot */}
              <div className="p-6 md:w-1/2 bg-gray-50 flex flex-col">
                <h4 className="text-sm font-bold text-charcoal/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  Payment Screenshot
                </h4>
                
                <div className="flex-1 border-2 border-dashed border-charcoal/10 rounded-2xl flex items-center justify-center bg-white overflow-hidden relative group">
                  {donation.screenshotUrl ? (
                    <img 
                      src={donation.screenshotUrl.startsWith('http') ? donation.screenshotUrl : `${donation.screenshotUrl}`} 
                      alt="Payment Screenshot" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-charcoal/20">
                        <FileImage className="w-8 h-8" />
                      </div>
                      <p className="text-sm text-charcoal/50 font-medium">No screenshot uploaded</p>
                      <p className="text-xs text-charcoal/40 mt-1">Please verify via bank statement</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-charcoal/5 bg-white shrink-0 flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isProcessing}
                className="text-charcoal/60 border-charcoal/20 hover:bg-gray-50"
              >
                Cancel
              </Button>
              
              <div className="flex gap-3">
                {donation.status === 'verified' && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!confirm('Record a refund for this donation?')) return;
                      setIsProcessing(true);
                      try {
                        await api.post(`/payments/${donation.id}/refund`, { reason: remark || 'Admin refund' });
                        toast.success('Refund recorded');
                        onActionComplete();
                        onClose();
                      } catch (error: any) {
                        toast.error(error.response?.data?.message || 'Refund failed');
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    disabled={isProcessing}
                  >
                    Refund
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => handleAction('failed')}
                  disabled={isProcessing}
                  className="text-red-500 border-red-500 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Payment
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => handleAction('verified')}
                  isLoading={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {!isProcessing && <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Verify & Generate Receipt
                </Button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
