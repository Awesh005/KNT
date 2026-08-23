import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageBanner } from '@/components/common/PageBanner';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { api } from '@/lib/fetcher';
import { fileToDataUrl } from '@/utils/portal';
import { useAuthStore } from '@/stores/authStore';

const TYPES = [
  { id: 'annual', label: 'Annual', fee: 1100 },
  { id: 'student', label: 'Student', fee: 500 },
  { id: 'lifetime', label: 'Lifetime', fee: 11000 },
];

export function Membership() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    membership_type: 'annual',
    kyc_pan: '',
    kyc_id_type: 'Aadhaar',
    kyc_id_number: '',
    address: '',
    city: '',
    payment_ref: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const fee = TYPES.find((item) => item.id === form.membership_type)?.fee || 1100;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) {
      toast.error('Upload a passport photo');
      return;
    }
    setBusy(true);
    try {
      await api.post('/people/memberships', {
        ...form,
        photo_base64: await fileToDataUrl(photo),
        screenshot_base64: screenshot ? await fileToDataUrl(screenshot) : undefined,
      });
      setDone(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not submit');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageBanner title="Become a Member" subtitle="Join KNT World Welfare Foundation. After approval you get an ID card, certificate, and member portal." />
      <section className="py-16 bg-fog-gray">
        <div className="max-w-3xl mx-auto px-4">
          {done ? (
            <div className="bg-white rounded-3xl p-10 text-center">
              <Typography variant="h3">Application received</Typography>
              <p className="text-charcoal/60 mt-3">We will verify your fee and KYC, then email your member ID and portal login.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white rounded-3xl border border-charcoal/5 p-8 space-y-5">
              <div className="grid sm:grid-cols-3 gap-3">
                {TYPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setForm({ ...form, membership_type: item.id })}
                    className={`rounded-2xl border p-4 text-left ${form.membership_type === item.id ? 'border-deep-green bg-deep-green/5' : 'border-charcoal/10'}`}
                  >
                    <p className="font-bold">{item.label}</p>
                    <p className="text-deep-green font-bold">₹{item.fee.toLocaleString('en-IN')}</p>
                  </button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input label="PAN" value={form.kyc_pan} onChange={(e) => setForm({ ...form, kyc_pan: e.target.value.toUpperCase() })} />
                <Input label="ID type" value={form.kyc_id_type} onChange={(e) => setForm({ ...form, kyc_id_type: e.target.value })} />
                <Input label="ID number" value={form.kyc_id_number} onChange={(e) => setForm({ ...form, kyc_id_number: e.target.value })} />
                <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <label className="block text-sm font-bold">Passport photo *
                <input type="file" accept="image/*" className="block mt-2" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
              </label>
              <Input label="UPI / UTR (fee)" value={form.payment_ref} onChange={(e) => setForm({ ...form, payment_ref: e.target.value })} />
              <label className="block text-sm font-bold">Fee screenshot
                <input type="file" accept="image/*" className="block mt-2" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} />
              </label>
              <Button type="submit" isLoading={busy}>Submit membership · ₹{fee.toLocaleString('en-IN')}</Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
