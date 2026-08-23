import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CreditCard, Heart, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useAuthStore } from '@/stores/authStore';
import { getImageUrl } from '@/utils/getImageUrl';

type Step = 'amount' | 'payment' | 'processing' | 'success';

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000];

const slideVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export interface DonationFlowProps {
  campaignId?: string | number | null;
  allowCampaignSelect?: boolean;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function DonationFlow({
  campaignId,
  allowCampaignSelect = false,
  onComplete,
  onCancel,
}: DonationFlowProps) {
  const { user } = useAuthStore();
  const { data: settingsData } = useSWR('/cms/global/settings', fetcher);
  const { data: campaignsData } = useSWR(allowCampaignSelect ? '/campaigns?status=approved&limit=50' : null, fetcher);
  const { data: payConfig } = useSWR('/payments/config', fetcher);
  const gatewayEnabled = Boolean(payConfig?.enabled);
  const paymentQRUrl =
    settingsData?.content?.paymentQR ||
    settingsData?.content?.upiQr ||
    settingsData?.content?.upi_qr ||
    settingsData?.content?.qr_url ||
    '';
  const campaigns = campaignsData?.campaigns || [];

  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState<number>(2500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [tipPercentage, setTipPercentage] = useState<number>(5);
  const [file, setFile] = useState<File | null>(null);
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaignId ? String(campaignId) : '');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [donorPhone, setDonorPhone] = useState(user?.mobile || '');
  const [donorPan, setDonorPan] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [donorCity, setDonorCity] = useState('');
  const [donorState, setDonorState] = useState('');
  const [donorPincode, setDonorPincode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.name) setDonorName(user.name);
    if (user?.email) setDonorEmail(user.email);
    if (user?.mobile) setDonorPhone(user.mobile);
  }, [user]);

  useEffect(() => {
    if (campaignId) setSelectedCampaignId(String(campaignId));
  }, [campaignId]);

  const finalAmount = customAmount ? parseInt(customAmount) || 0 : amount;
  const tipAmount = Math.round((finalAmount * tipPercentage) / 100);
  const totalAmount = finalAmount + tipAmount;

  const handleProceedToPayment = () => {
    if (finalAmount < 100) return;
    if (!donorName.trim() || !donorEmail.trim()) {
      setError('Please enter your name and email so we can send the receipt.');
      return;
    }
    if (donorPan.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(donorPan.trim().toUpperCase())) {
      setError('PAN must be in AAAAA9999A format.');
      return;
    }
    if (!donorCity.trim()) {
      setError('Please enter your city for the donation record.');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handleSbiPay = async () => {
    setError('');
    setStep('processing');
    try {
      const { default: api } = await import('@/lib/axios');
      const res = await api.post('/payments/orders', {
        amount: finalAmount,
        tip_amount: tipAmount,
        campaign_id: selectedCampaignId || undefined,
        donor_name: donorName.trim(),
        donor_email: donorEmail.trim(),
        donor_phone: donorPhone.trim() || undefined,
        donor_pan: donorPan.trim() || undefined,
        donor_address: donorAddress.trim() || undefined,
        donor_city: donorCity.trim() || undefined,
        donor_state: donorState.trim() || undefined,
        donor_pincode: donorPincode.trim() || undefined,
      });
      const order = res.data.data;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = order.gatewayUrl;
      Object.entries(order.fields || {}).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value ?? '');
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      const message = err.response?.data?.message || 'SBI checkout is not available yet. Use UPI screenshot.';
      setError(message);
      toast.error(message);
      setStep('payment');
    }
  };

  const handleSubmitDonation = async () => {
    if (!file && !paymentRef.trim()) {
      setError('Upload a payment screenshot or enter the UTR number.');
      return;
    }

    setError('');
    setStep('processing');
    try {
      const { default: api } = await import('@/lib/axios');

      let screenshot_base64: string | undefined;
      if (file) {
        screenshot_base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
        });
      }

      await api.post('/donations', {
        amount: finalAmount,
        tip_amount: tipAmount,
        campaign_id: selectedCampaignId || undefined,
        payment_ref: paymentRef || '',
        screenshot_base64,
        donor_name: donorName.trim(),
        donor_email: donorEmail.trim(),
        donor_phone: donorPhone.trim() || undefined,
        donor_pan: donorPan.trim() || undefined,
        donor_address: donorAddress.trim() || undefined,
        donor_city: donorCity.trim() || undefined,
        donor_state: donorState.trim() || undefined,
        donor_pincode: donorPincode.trim() || undefined,
        payment_mode: 'UPI',
      });
      setStep('success');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not record the donation. Please try again.';
      setError(message);
      toast.error(message);
      setStep('payment');
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'amount' && (
        <motion.div key="amount" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
          {allowCampaignSelect && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-charcoal mb-2">
                Support a campaign (optional)
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-charcoal/15 rounded-xl text-[13px] text-charcoal outline-none focus:border-goldenrod focus:ring-2 focus:ring-goldenrod/20"
              >
                <option value="">General donation to the foundation</option>
                {campaigns.map((campaign: { id: string | number; title: string }) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Typography variant="small" className="font-bold text-charcoal uppercase tracking-[0.16em] mb-3 block">
              Select Amount (₹)
            </Typography>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { setAmount(preset); setCustomAmount(''); }}
                  className={`py-3 px-4 rounded-xl border transition-all ${
                    amount === preset && !customAmount
                      ? 'border-deep-green bg-deep-green/5 text-deep-green font-bold'
                      : 'border-charcoal/15 text-charcoal hover:border-charcoal/30'
                  }`}
                >
                  ₹{preset.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <Input
              placeholder="Or enter custom amount"
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount(0);
              }}
              min="100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Your name" />
            <Input label="Email" type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} placeholder="you@email.com" />
            <Input label="Phone" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} placeholder="Mobile number" />
            <Input label="PAN (for 80G)" value={donorPan} onChange={(e) => setDonorPan(e.target.value.toUpperCase())} placeholder="AAAAA9999A" />
            <Input label="Address" value={donorAddress} onChange={(e) => setDonorAddress(e.target.value)} placeholder="Street / locality" />
            <Input label="City *" value={donorCity} onChange={(e) => setDonorCity(e.target.value)} placeholder="City" />
            <Input label="State" value={donorState} onChange={(e) => setDonorState(e.target.value)} placeholder="State" />
            <Input label="PIN code" value={donorPincode} onChange={(e) => setDonorPincode(e.target.value)} placeholder="PIN" />
          </div>

          <div className="bg-fog-gray p-4 rounded-xl border border-charcoal/5">
            <Typography variant="small" className="font-bold text-charcoal block mb-2">
              Optional Tip for Platform Support
            </Typography>
            <div className="flex gap-2">
              {[0, 5, 10, 15].map((tip) => (
                <button
                  key={tip}
                  type="button"
                  onClick={() => setTipPercentage(tip)}
                  className={`flex-1 py-2 text-[12px] rounded-lg transition-all ${
                    tipPercentage === tip
                      ? 'bg-charcoal text-white font-bold'
                      : 'bg-white border border-charcoal/10 text-charcoal/60 hover:bg-charcoal/5'
                  }`}
                >
                  {tip}%
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="border-t border-charcoal/10 pt-4 flex justify-between items-center">
            <div>
              <Typography variant="small" className="text-charcoal/60 block">Total Donation</Typography>
              <Typography variant="h3" className="text-deep-green">
                ₹{totalAmount.toLocaleString('en-IN')}
              </Typography>
            </div>
            <Button onClick={handleProceedToPayment} disabled={finalAmount < 100} className="pl-6 pr-4">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}

      {step === 'payment' && (
        <motion.div key="payment" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
          <div className="text-center">
            <Typography variant="h3" className="mb-2">Payment Details</Typography>
            <Typography variant="body" className="text-charcoal/60">
              You are donating <span className="font-bold text-charcoal">₹{totalAmount.toLocaleString('en-IN')}</span>.
              {gatewayEnabled ? ' Pay on the SBI hosted page, or use UPI as a fallback.' : ' Scan the QR code with any UPI app.'}
            </Typography>
          </div>

          <div className="bg-fog-gray border border-charcoal/10 rounded-2xl p-6 flex flex-col items-center justify-center">
            {paymentQRUrl ? (
              <div className="w-44 h-44 bg-white rounded-xl border border-charcoal/10 p-2 mb-4">
                <img src={getImageUrl(paymentQRUrl)} alt="Payment QR" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-40 h-40 bg-white rounded-xl border border-charcoal/5 flex items-center justify-center mb-4">
                <CreditCard className="w-12 h-12 text-charcoal/40" />
              </div>
            )}
            <Typography variant="small" className="font-bold tracking-[0.1em] uppercase text-charcoal">
              Scan to Pay
            </Typography>
          </div>

          <Input
            label="Transaction Reference Number (UTR)"
            placeholder="Enter 12-digit UTR or Reference No."
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
          />

          <div>
            <Typography variant="small" className="font-bold text-charcoal uppercase tracking-[0.16em] mb-3 block">
              Upload Payment Screenshot
            </Typography>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-charcoal/15 border-dashed rounded-xl cursor-pointer bg-white hover:bg-charcoal/5 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-6 h-6 mb-2 text-charcoal/40" />
                <Typography variant="small" className="text-charcoal/60">
                  {file ? file.name : 'Click to upload screenshot'}
                </Typography>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            className="w-full"
            size="lg"
            onClick={gatewayEnabled ? handleSbiPay : handleSubmitDonation}
            disabled={!gatewayEnabled && !file && !paymentRef.trim()}
          >
            {gatewayEnabled ? 'Pay securely with SBI ePay' : 'Confirm Donation'}
          </Button>
          {gatewayEnabled && (
            <>
              <p className="text-center text-xs text-charcoal/40 uppercase tracking-wider">or pay by UPI screenshot</p>
              <Button className="w-full" variant="outline" onClick={handleSubmitDonation} disabled={!file && !paymentRef.trim()}>
                Submit UPI screenshot
              </Button>
            </>
          )}
          <button
            type="button"
            className="w-full py-2 text-[12px] font-bold text-charcoal/50 hover:text-charcoal uppercase tracking-[0.1em] transition-colors"
            onClick={() => setStep('amount')}
          >
            Back to Amount
          </button>
        </motion.div>
      )}

      {step === 'processing' && (
        <motion.div key="processing" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 border-4 border-deep-green/20 border-t-deep-green rounded-full animate-spin mb-6" />
          <Typography variant="h3" className="mb-2">Recording Donation...</Typography>
          <Typography variant="body" className="text-charcoal/60">Please wait while we save your payment details.</Typography>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div key="success" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="py-8 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
            className="w-20 h-20 bg-deep-green/10 text-deep-green rounded-full flex items-center justify-center mb-6"
          >
            <Heart className="w-10 h-10 fill-current" />
          </motion.div>
          <Typography variant="h2" className="mb-3">Thank You!</Typography>
          <Typography variant="body" className="text-charcoal/60 mb-8 max-w-sm">
            Your donation of <span className="font-bold text-charcoal">₹{totalAmount.toLocaleString('en-IN')}</span> has been recorded. We will email your receipt after verification.
          </Typography>
          <Button onClick={onComplete} className="w-full">
            Done
          </Button>
          {onCancel && (
            <button type="button" className="mt-3 text-sm text-charcoal/50" onClick={onCancel}>
              Close
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
