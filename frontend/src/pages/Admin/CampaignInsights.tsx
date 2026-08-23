import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, X, TrendingUp, Users, Trash2, MapPin, Camera, IndianRupee } from 'lucide-react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { fetcher, api } from '@/lib/fetcher';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { getImageUrl } from '@/utils/getImageUrl';
import { SDG_OPTIONS, osmEmbedUrl, fileToDataUrl } from '@/constants/sdg';
import type { Campaign, Payout, Donation } from '@/types';

export function CampaignInsights() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: campaignRes, error: campaignError, mutate: mutateCampaign } = useSWR(id ? `/campaigns/${id}` : null, fetcher);
  const { data: impactRes, mutate: mutateImpact } = useSWR(id ? `/impact/campaigns/${id}` : null, fetcher);
  const { data: payoutsRes, mutate: mutatePayouts } = useSWR(id ? `/campaigns/${id}/payouts` : null, fetcher);
  const { data: donationsRes, mutate: mutateDonations } = useSWR(id ? `/donations?campaignId=${id}&limit=100` : null, fetcher);

  const campaign: Campaign = campaignRes?.campaign;
  const payouts: Payout[] = payoutsRes?.payouts || [];
  const donations: Donation[] = donationsRes?.data?.donations || donationsRes?.donations || [];
  const money = impactRes?.money;
  const beneficiaries = impactRes?.beneficiaries || [];
  const updates = impactRes?.updates || [];
  const photos: string[] = impactRes?.photos || [];

  const verifiedDonations = donations.filter((d) => d.status === 'verified');
  const totalSupporters = verifiedDonations.length;

  const [newPayout, setNewPayout] = useState({
    amount: '',
    transfer_date: '',
    account_holder: '',
    account_details: '',
    transferred_to: '',
  });
  const [isAddingPayout, setIsAddingPayout] = useState(false);
  const [locationForm, setLocationForm] = useState({ latitude: '', longitude: '', location_label: '', program_key: '', sdg_tags: [] as string[] });
  const [studentForm, setStudentForm] = useState({ school: '', class: '', course: '', fees: '' });
  const [personForm, setPersonForm] = useState({ name: '', kind: 'patient', age: '', gender: '', city: '', photo_base64: '' });
  const [updateForm, setUpdateForm] = useState({ title: '', body: '', is_public: true, photo_base64: [] as string[] });

  useEffect(() => {
    if (campaign) {
      setNewPayout((prev) => ({
        ...prev,
        account_holder: prev.account_holder || (campaign as any).account_holder_name || '',
        account_details: prev.account_details || (campaign as any).account_number || '',
      }));
      const raw = campaign as any;
      setLocationForm({
        latitude: raw.latitude != null ? String(raw.latitude) : '',
        longitude: raw.longitude != null ? String(raw.longitude) : '',
        location_label: raw.location_label || '',
        program_key: raw.program_key || '',
        sdg_tags: Array.isArray(raw.sdg_tags) ? raw.sdg_tags : String(raw.sdg_tags || '').split(',').filter(Boolean),
      });
      const student = raw.student_details || {};
      setStudentForm({
        school: student.school || '',
        class: student.class || '',
        course: student.course || '',
        fees: student.fees != null ? String(student.fees) : '',
      });
    }
  }, [campaign]);

  const handleAddPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAddingPayout(true);
      await api.post(`/campaigns/${id}/payouts`, newPayout);
      toast.success('Payout added successfully');
      setNewPayout({ amount: '', transfer_date: '', account_holder: (campaign as any).account_holder_name || '', account_details: (campaign as any).account_number || '', transferred_to: '' });
      mutatePayouts();
      mutateImpact();
    } catch (error) {
      toast.error('Failed to add payout');
    } finally {
      setIsAddingPayout(false);
    }
  };

  const handleRemovePayout = async (payoutId: number) => {
    if (!confirm('Are you sure you want to remove this payout?')) return;
    try {
      await api.delete(`/campaigns/${id}/payouts/${payoutId}`);
      toast.success('Payout removed successfully');
      mutatePayouts();
      mutateImpact();
    } catch (error) {
      toast.error('Failed to remove payout');
    }
  };

  const handleDeleteDonation = async (donationId: string) => {
    if (!confirm('Are you sure you want to permanently delete this donation? This action cannot be undone.')) return;
    try {
      await api.delete(`/donations/${donationId}`);
      toast.success('Donation deleted successfully');
      mutateDonations();
      mutateImpact();
    } catch (error) {
      toast.error('Failed to delete donation');
    }
  };

  const saveLocation = async () => {
    try {
      await api.patch(`/campaigns/${id}`, {
        latitude: locationForm.latitude ? Number(locationForm.latitude) : null,
        longitude: locationForm.longitude ? Number(locationForm.longitude) : null,
        location_label: locationForm.location_label || null,
        program_key: locationForm.program_key || null,
        sdg_tags: locationForm.sdg_tags.join(','),
        student_details: studentForm,
      });
      toast.success('Project details saved');
      mutateCampaign();
      mutateImpact();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not save project details');
    }
  };

  const addPerson = async () => {
    if (!personForm.name) return toast.error('Name is required');
    try {
      await api.post(`/impact/campaigns/${id}/beneficiaries`, personForm);
      toast.success('Person added');
      setPersonForm({ name: '', kind: 'patient', age: '', gender: '', city: '', photo_base64: '' });
      mutateImpact();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not add person');
    }
  };

  const removePerson = async (beneficiaryId: number) => {
    if (!confirm('Remove this person from the project?')) return;
    try {
      await api.delete(`/impact/campaigns/${id}/beneficiaries/${beneficiaryId}`);
      toast.success('Removed');
      mutateImpact();
    } catch (error) {
      toast.error('Could not remove');
    }
  };

  const addUpdate = async () => {
    if (!updateForm.title) return toast.error('Title is required');
    try {
      await api.post(`/impact/campaigns/${id}/updates`, updateForm);
      toast.success('Progress update posted');
      setUpdateForm({ title: '', body: '', is_public: true, photo_base64: [] });
      mutateImpact();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not post update');
    }
  };

  const removeUpdate = async (updateId: number) => {
    if (!confirm('Remove this update?')) return;
    try {
      await api.delete(`/impact/campaigns/${id}/updates/${updateId}`);
      toast.success('Update removed');
      mutateImpact();
    } catch (error) {
      toast.error('Could not remove update');
    }
  };

  if (campaignError) return <div className="p-6 text-red-500">Failed to load campaign.</div>;
  if (!campaign) return <div className="p-6 animate-pulse">Loading dashboard...</div>;

  const lat = Number(locationForm.latitude);
  const lng = Number(locationForm.longitude);
  const hasMap = Number.isFinite(lat) && Number.isFinite(lng) && locationForm.latitude && locationForm.longitude;
  const raised = money?.raised ?? ((campaign as any).raised_amount ?? campaign.raisedAmount ?? 0);
  const target = money?.target ?? ((campaign as any).target_amount ?? campaign.targetAmount ?? 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/campaigns')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-charcoal/60" />
          </button>
          <div>
            <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
              Project dossier
            </Typography>
            <Typography variant="body" className="text-charcoal/60 text-sm">
              {campaign.title}
            </Typography>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<IndianRupee className="w-6 h-6" />} label="Raised" value={`₹${Number(raised).toLocaleString('en-IN')}`} hint={`of ₹${Number(target).toLocaleString('en-IN')} target`} />
        <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Spent" value={`₹${Number(money?.spent || 0).toLocaleString('en-IN')}`} hint={`Payouts ₹${Number(money?.payouts || 0).toLocaleString('en-IN')} · Expenses ₹${Number(money?.expenses || 0).toLocaleString('en-IN')}`} />
        <StatCard icon={<IndianRupee className="w-6 h-6" />} label="Remaining" value={`₹${Number(money?.remaining || 0).toLocaleString('en-IN')}`} hint={money?.allocated ? `Budget allocated ₹${Number(money.allocated).toLocaleString('en-IN')}` : 'Budget vs donations vs payouts'} />
        <StatCard icon={<Users className="w-6 h-6" />} label="People" value={String(beneficiaries.length)} hint={`${totalSupporters} verified supporters`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-deep-green" />
            <Typography variant="h3" className="text-deep-green">Location</Typography>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Latitude" value={locationForm.latitude} onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })} className="px-4 py-2 border border-charcoal/10 rounded-xl text-sm" />
            <input placeholder="Longitude" value={locationForm.longitude} onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })} className="px-4 py-2 border border-charcoal/10 rounded-xl text-sm" />
          </div>
          <input placeholder="Place label (village / hospital / school)" value={locationForm.location_label} onChange={(e) => setLocationForm({ ...locationForm, location_label: e.target.value })} className="w-full px-4 py-2 border border-charcoal/10 rounded-xl text-sm" />
          <input placeholder="Linked program key (optional)" value={locationForm.program_key} onChange={(e) => setLocationForm({ ...locationForm, program_key: e.target.value })} className="w-full px-4 py-2 border border-charcoal/10 rounded-xl text-sm" />
          <div className="flex flex-wrap gap-2">
            {SDG_OPTIONS.map((item) => {
              const on = locationForm.sdg_tags.includes(item.code);
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLocationForm({
                    ...locationForm,
                    sdg_tags: on ? locationForm.sdg_tags.filter((code) => code !== item.code) : [...locationForm.sdg_tags, item.code],
                  })}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${on ? 'bg-deep-green text-white' : 'bg-gray-100 text-charcoal/60'}`}
                >
                  SDG {item.code} · {item.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="School / institution" value={studentForm.school} onChange={(e) => setStudentForm({ ...studentForm, school: e.target.value })} className="px-4 py-2 border border-charcoal/10 rounded-xl text-sm" />
            <input placeholder="Class / course" value={studentForm.class} onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })} className="px-4 py-2 border border-charcoal/10 rounded-xl text-sm" />
            <input placeholder="Course name" value={studentForm.course} onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })} className="px-4 py-2 border border-charcoal/10 rounded-xl text-sm" />
            <input placeholder="Fees (₹)" value={studentForm.fees} onChange={(e) => setStudentForm({ ...studentForm, fees: e.target.value })} className="px-4 py-2 border border-charcoal/10 rounded-xl text-sm" />
          </div>
          <Button type="button" onClick={saveLocation}>Save location & SDG</Button>
          {hasMap ? (
            <iframe
              title="Project map"
              src={osmEmbedUrl(lat, lng)}
              className="w-full h-64 rounded-2xl border border-charcoal/10"
            />
          ) : (
            <p className="text-sm text-charcoal/50">Add latitude and longitude to show the map.</p>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-deep-green" />
            <Typography variant="h3" className="text-deep-green">People</Typography>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Name" value={personForm.name} onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })} className="px-4 py-2 border border-charcoal/10 rounded-xl text-sm" />
            <select value={personForm.kind} onChange={(e) => setPersonForm({ ...personForm, kind: e.target.value })} className="px-4 py-2 border border-charcoal/10 rounded-xl text-sm">
              <option value="patient">Patient</option>
              <option value="student">Student</option>
              <option value="other">Other</option>
            </select>
            <input placeholder="Age" value={personForm.age} onChange={(e) => setPersonForm({ ...personForm, age: e.target.value })} className="px-4 py-2 border border-charcoal/10 rounded-xl text-sm" />
            <input placeholder="City" value={personForm.city} onChange={(e) => setPersonForm({ ...personForm, city: e.target.value })} className="px-4 py-2 border border-charcoal/10 rounded-xl text-sm" />
            <input placeholder="Gender" value={personForm.gender} onChange={(e) => setPersonForm({ ...personForm, gender: e.target.value })} className="px-4 py-2 border border-charcoal/10 rounded-xl text-sm" />
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) setPersonForm({ ...personForm, photo_base64: await fileToDataUrl(file) });
            }} className="text-xs" />
          </div>
          <Button type="button" onClick={addPerson}>Add person</Button>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {beneficiaries.length === 0 && <p className="text-sm text-charcoal/50">No people linked yet.</p>}
            {beneficiaries.map((row: any) => (
              <div key={row.id} className="flex items-center gap-3 border border-charcoal/5 rounded-xl p-3">
                {row.photo_url ? <img src={getImageUrl(row.photo_url)} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-gray-100" />}
                <div className="flex-1">
                  <p className="font-bold text-sm">{row.name}</p>
                  <p className="text-xs text-charcoal/50 capitalize">{row.kind} {row.city ? `· ${row.city}` : ''} {row.age ? `· ${row.age}` : ''}</p>
                </div>
                <button onClick={() => removePerson(row.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-charcoal/5 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-deep-green" />
          <Typography variant="h3" className="text-deep-green">Photos & progress</Typography>
        </div>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {photos.map((src) => (
              <img key={src} src={getImageUrl(src)} alt="" className="w-full h-24 object-cover rounded-xl border border-charcoal/5" />
            ))}
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-3">
          <input placeholder="Update title" value={updateForm.title} onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })} className="px-4 py-2 border border-charcoal/10 rounded-xl text-sm" />
          <label className="flex items-center gap-2 text-sm text-charcoal/70">
            <input type="checkbox" checked={updateForm.is_public} onChange={(e) => setUpdateForm({ ...updateForm, is_public: e.target.checked })} />
            Show on public campaign page
          </label>
        </div>
        <textarea placeholder="What changed on this project?" value={updateForm.body} onChange={(e) => setUpdateForm({ ...updateForm, body: e.target.value })} className="w-full px-4 py-2 border border-charcoal/10 rounded-xl text-sm h-24" />
        <input type="file" accept="image/*" multiple onChange={async (e) => {
          const files = Array.from(e.target.files || []);
          const urls = await Promise.all(files.map(fileToDataUrl));
          setUpdateForm({ ...updateForm, photo_base64: urls });
        }} className="text-xs" />
        <Button type="button" onClick={addUpdate}>Post update</Button>
        <div className="divide-y divide-charcoal/5">
          {updates.map((row: any) => (
            <div key={row.id} className="py-4 flex justify-between gap-4">
              <div>
                <p className="font-bold">{row.title} {row.is_public ? <span className="text-[10px] uppercase text-deep-green">Public</span> : <span className="text-[10px] uppercase text-charcoal/40">Internal</span>}</p>
                <p className="text-sm text-charcoal/60">{row.body}</p>
                <p className="text-xs text-charcoal/40 mt-1">{new Date(row.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => removeUpdate(row.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg self-start"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
          <div className="p-6 border-b border-charcoal/5">
            <Typography variant="h3" className="text-deep-green">Manage Payouts</Typography>
            <Typography variant="body" className="text-charcoal/60 text-sm">Record funds transferred for this campaign</Typography>
          </div>

          <div className="p-6 border-b border-charcoal/5 bg-gray-50">
            <form onSubmit={handleAddPayout} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Transfer Date</label>
                <input
                  type="date"
                  value={newPayout.transfer_date}
                  onChange={(e) => setNewPayout({ ...newPayout, transfer_date: e.target.value })}
                  className="w-full px-4 py-2 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={newPayout.amount}
                  onChange={(e) => setNewPayout({ ...newPayout, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green bg-white"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Account Holder</label>
                <input
                  type="text"
                  value={newPayout.account_holder}
                  onChange={(e) => setNewPayout({ ...newPayout, account_holder: e.target.value })}
                  className="w-full px-4 py-2 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Account Details (e.g. XXXX 1234)</label>
                <input
                  type="text"
                  value={newPayout.account_details}
                  onChange={(e) => setNewPayout({ ...newPayout, account_details: e.target.value })}
                  className="w-full px-4 py-2 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase mb-1">Transferred To</label>
                <input
                  type="text"
                  value={newPayout.transferred_to}
                  onChange={(e) => setNewPayout({ ...newPayout, transferred_to: e.target.value })}
                  className="w-full px-4 py-2 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green bg-white"
                  required
                  placeholder="e.g. Family Member"
                />
              </div>
              <div>
                <Button type="submit" variant="primary" className="w-full" isLoading={isAddingPayout}>Add Payout</Button>
              </div>
            </form>
          </div>

          <div className="p-0">
            {payouts.length === 0 ? (
              <div className="p-8 text-center text-charcoal/50 text-sm">No payouts added yet.</div>
            ) : (
              <div className="divide-y divide-charcoal/5">
                {payouts.map((payout) => (
                  <div key={payout.id} className="p-6 flex flex-col sm:flex-row justify-between gap-4 sm:items-center hover:bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-charcoal/40">Date</div>
                        <div className="text-sm font-bold">{new Date(payout.transfer_date).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-charcoal/40">Amount</div>
                        <div className="text-sm font-bold text-deep-green">₹{Number(payout.amount).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-charcoal/40">Holder / Acc</div>
                        <div className="text-sm">{payout.account_holder} <br /><span className="text-xs text-charcoal/60">{payout.account_details}</span></div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-charcoal/40">To</div>
                        <div className="text-sm">{payout.transferred_to}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePayout(payout.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start sm:self-center shrink-0"
                      title="Remove Payout"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden">
          <div className="p-6 border-b border-charcoal/5">
            <Typography variant="h3" className="text-deep-green">Campaign Donations</Typography>
            <Typography variant="body" className="text-charcoal/60 text-sm">All donations received for this specific campaign</Typography>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-charcoal/50 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">ID & Date</th>
                  <th className="px-6 py-4">Donor</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-charcoal/50">No donations found for this campaign.</td>
                  </tr>
                ) : (
                  donations.map((donation: any) => (
                    <tr key={donation.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs">{donation.id}</div>
                        <div className="text-charcoal/50 mt-1">{new Date(donation.donatedAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold">{donation.donorName || 'Anonymous'}</div>
                        <div className="text-charcoal/50 text-xs mt-1">{donation.donorEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-deep-green">
                        ₹{Number(donation.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          donation.status === 'verified' ? 'bg-green-100 text-green-700' :
                          donation.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          title="Delete Donation"
                          onClick={() => handleDeleteDonation(donation.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-charcoal/5 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 bg-light-green rounded-full flex items-center justify-center text-deep-green">
        {icon}
      </div>
      <div>
        <Typography variant="small" className="text-charcoal/50 font-bold uppercase tracking-wider mb-1">{label}</Typography>
        <Typography variant="h2" className="text-deep-green m-0 p-0 leading-none !text-xl">{value}</Typography>
        <Typography variant="small" className="text-charcoal/40">{hint}</Typography>
      </div>
    </div>
  );
}
