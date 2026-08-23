import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { useAuthStore } from '@/stores/authStore';
import { fetcher, api } from '@/lib/fetcher';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { getImageUrl } from '@/utils/getImageUrl';
import { fileToDataUrl } from '@/utils/portal';

export function Portal() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  if (user?.role === 'Member') return <MemberPortal />;
  if (user?.role === 'Volunteer') return <VolunteerPortal />;
  if (user?.role === 'Employee') return <StaffPortal />;

  return (
    <div className="min-h-screen bg-fog-gray pt-28 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 text-center">
        <Typography variant="h3">No people portal for this account</Typography>
        <p className="text-charcoal/60 mt-2">Donors can use the giving dashboard. Apply for membership or volunteering from the website.</p>
        <div className="flex gap-3 justify-center mt-6">
          <Link to="/dashboard"><Button variant="outline">Donor dashboard</Button></Link>
          <Link to="/membership"><Button>Membership</Button></Link>
        </div>
      </div>
    </div>
  );
}

function MemberPortal() {
  const { data, mutate } = useSWR('/people/me/membership', fetcher);
  const m = data?.membership;
  const [ref, setRef] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const renew = async () => {
    try {
      await api.post('/people/me/membership/renew', {
        payment_ref: ref,
        screenshot_base64: file ? await fileToDataUrl(file) : undefined,
      });
      toast.success('Renewal submitted');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not renew');
    }
  };

  if (!m) return <Shell title="Member portal">Loading membership...</Shell>;

  return (
    <Shell title="Member portal" subtitle={`${m.member_no || 'Pending'} · ${m.membership_type}`}>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Status" value={m.status} />
        <Stat label="Expires" value={m.expires_at ? String(m.expires_at).slice(0, 10) : '—'} />
        <Stat label="Fee" value={`₹${Number(m.fee).toLocaleString('en-IN')}`} />
      </div>
      <div className="flex flex-wrap gap-3 mb-8">
        {m.id_card_url && <a href={getImageUrl(m.id_card_url)} target="_blank" rel="noreferrer"><Button>ID card</Button></a>}
        {m.certificate_url && <a href={getImageUrl(m.certificate_url)} target="_blank" rel="noreferrer"><Button variant="outline">Certificate</Button></a>}
        <Link to="/dashboard"><Button variant="ghost">Donation receipts</Button></Link>
      </div>
      <div className="bg-white rounded-3xl p-6 border border-charcoal/5">
        <p className="font-bold mb-3">Renew membership</p>
        <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="UTR" className="w-full border rounded-xl px-3 py-2 text-sm mb-3" />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Button className="mt-3" onClick={renew}>Submit renewal</Button>
      </div>
      <div className="mt-6">
        <p className="font-bold mb-2">Fee receipts</p>
        {(m.receipts || []).map((row: any) => (
          <a key={row.id} href={getImageUrl(row.pdf_url)} className="block text-deep-green text-sm" target="_blank" rel="noreferrer">
            {row.receipt_no} · ₹{row.amount}
          </a>
        ))}
      </div>
    </Shell>
  );
}

function VolunteerPortal() {
  const { data, mutate } = useSWR('/people/me/volunteer', fetcher);
  const v = data?.volunteer;
  const [hours, setHours] = useState({ work_date: '', hours: '', notes: '' });

  const logHours = async () => {
    try {
      await api.post('/people/me/volunteer/hours', hours);
      toast.success('Hours logged');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not log hours');
    }
  };

  if (!v) return <Shell title="Volunteer portal">Loading...</Shell>;

  return (
    <Shell title="Volunteer portal" subtitle={v.volunteer_no || 'Pending approval'}>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Status" value={v.status} />
        <Stat label="Hours" value={String(v.hours_total || 0)} />
        <Stat label="Skills" value={v.skills || '—'} />
      </div>
      {v.id_card_url && <a href={getImageUrl(v.id_card_url)} target="_blank" rel="noreferrer"><Button className="mb-8">Download ID card</Button></a>}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-charcoal/5">
          <p className="font-bold mb-3">Log hours</p>
          <input type="date" value={hours.work_date} onChange={(e) => setHours({ ...hours, work_date: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm mb-2" />
          <input type="number" placeholder="Hours" value={hours.hours} onChange={(e) => setHours({ ...hours, hours: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm mb-2" />
          <input placeholder="Notes" value={hours.notes} onChange={(e) => setHours({ ...hours, notes: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm mb-3" />
          <Button onClick={logHours}>Save hours</Button>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-charcoal/5">
          <p className="font-bold mb-3">Assignments</p>
          {(v.assignments || []).map((row: any) => (
            <div key={row.id} className="border-t border-charcoal/5 py-3 text-sm">
              <p className="font-bold">{row.title}</p>
              <p className="text-charcoal/50">{row.scheduled_at ? String(row.scheduled_at).slice(0, 10) : ''} · {row.status}</p>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function StaffPortal() {
  const { data, mutate } = useSWR('/people/me/employee', fetcher);
  const { data: filesData } = useSWR('/office/files', fetcher);
  const e = data?.employee;
  const [leave, setLeave] = useState({ leave_type: 'casual', from_date: '', to_date: '', reason: '' });

  const checkIn = async () => {
    try {
      const res = await api.post('/people/me/attendance', { method: 'manual' });
      toast.success(res.data?.data?.already ? 'Already marked today' : 'Attendance marked');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not check in');
    }
  };

  const applyLeave = async () => {
    try {
      await api.post('/people/me/leave', leave);
      toast.success('Leave applied');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not apply');
    }
  };

  if (!e) return <Shell title="Staff portal">Loading...</Shell>;

  return (
    <Shell title="Staff portal" subtitle={`${e.employee_no} · ${e.designation || ''}`}>
      <div className="flex flex-wrap gap-3 mb-8">
        <Button onClick={checkIn}>Mark today's attendance</Button>
        {e.welcome_kit_url && <a href={getImageUrl(e.welcome_kit_url)} target="_blank" rel="noreferrer"><Button variant="outline">Welcome kit</Button></a>}
        <Link to="/attendance/check-in"><Button variant="ghost">QR check-in page</Button></Link>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Casual" value={String(e.balance?.casual ?? '—')} />
        <Stat label="Sick" value={String(e.balance?.sick ?? '—')} />
        <Stat label="Earned" value={String(e.balance?.earned ?? '—')} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-charcoal/5 space-y-2">
          <p className="font-bold">Apply leave</p>
          <select value={leave.leave_type} onChange={(ev) => setLeave({ ...leave, leave_type: ev.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm">
            <option value="casual">Casual</option>
            <option value="sick">Sick</option>
            <option value="earned">Earned</option>
          </select>
          <input type="date" value={leave.from_date} onChange={(ev) => setLeave({ ...leave, from_date: ev.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
          <input type="date" value={leave.to_date} onChange={(ev) => setLeave({ ...leave, to_date: ev.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Reason" value={leave.reason} onChange={(ev) => setLeave({ ...leave, reason: ev.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" />
          <Button onClick={applyLeave}>Submit leave</Button>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-charcoal/5">
          <p className="font-bold mb-3">Announcements</p>
          {(e.announcements || []).map((row: any) => (
            <div key={row.id} className="border-t border-charcoal/5 py-3">
              <p className="font-bold text-sm">{row.title}</p>
              <p className="text-sm text-charcoal/60">{row.body}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-3xl p-6 border border-charcoal/5">
          <p className="font-bold mb-3">Internal files</p>
          {(filesData?.files || []).slice(0, 8).map((row: any) => (
            <a key={row.id} href={getImageUrl(row.url)} target="_blank" rel="noreferrer" className="block text-sm text-deep-green py-2 border-t border-charcoal/5">
              {row.title || row.original_name}
            </a>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-fog-gray pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Typography variant="h2" className="text-deep-green">{title}</Typography>
        {subtitle && <p className="text-charcoal/50 mb-8">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-charcoal/5">
      <p className="text-xs uppercase tracking-wider text-charcoal/45">{label}</p>
      <p className="font-bold text-deep-green mt-1 capitalize">{value}</p>
    </div>
  );
}
