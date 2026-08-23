import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageBanner } from '@/components/common/PageBanner';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { api } from '@/lib/fetcher';
import { fileToDataUrl } from '@/utils/portal';
import { useAuthStore } from '@/stores/authStore';

export function Volunteer() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    skills: '',
    availability: 'Weekends',
    city: '',
    message: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/people/volunteers', {
        ...form,
        photo_base64: photo ? await fileToDataUrl(photo) : undefined,
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
      <PageBanner title="Volunteer with us" subtitle="Share your skills and time. After admin approval you get a volunteer ID and portal for hours and assignments." />
      <section className="py-16 bg-fog-gray">
        <div className="max-w-3xl mx-auto px-4">
          {done ? (
            <div className="bg-white rounded-3xl p-10 text-center">
              <Typography variant="h3">Thank you</Typography>
              <p className="text-charcoal/60 mt-3">Our team will review your registration and email next steps.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white rounded-3xl border border-charcoal/5 p-8 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <Input label="Skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Teaching, medical, field work" />
                <Input label="Availability" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} />
              </div>
              <textarea
                className="w-full min-h-[100px] border border-charcoal/15 rounded-xl px-3 py-2 text-sm"
                placeholder="Why do you want to volunteer?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <label className="block text-sm font-bold">Photo
                <input type="file" accept="image/*" className="block mt-2" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
              </label>
              <Button type="submit" isLoading={busy}>Register as volunteer</Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
