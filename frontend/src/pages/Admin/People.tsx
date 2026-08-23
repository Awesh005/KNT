import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { fetcher, api } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';

const TABS = ['Members', 'Volunteers', 'Employees', 'Attendance', 'Leave', 'Announcements'] as const;

export function People() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Members');
  const { data: membersData, mutate: mutateMembers } = useSWR('/people/memberships', fetcher);
  const { data: volunteersData, mutate: mutateVolunteers } = useSWR('/people/volunteers', fetcher);
  const { data: employeesData, mutate: mutateEmployees } = useSWR('/people/employees', fetcher);
  const { data: attendanceData, mutate: mutateAttendance } = useSWR('/people/attendance', fetcher);
  const { data: leaveData, mutate: mutateLeave } = useSWR('/people/leave', fetcher);
  const { data: announcementsData, mutate: mutateAnnouncements } = useSWR('/people/announcements', fetcher);

  const decide = async (kind: 'memberships' | 'volunteers', id: string, status: string) => {
    try {
      await api.post(`/people/${kind}/${id}/decide`, { status });
      toast.success(status === 'active' ? 'Approved' : 'Rejected');
      mutateMembers();
      mutateVolunteers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="!text-2xl text-deep-green mb-1">People</Typography>
        <Typography variant="body" className="text-charcoal/60 text-sm">Members, volunteers, employees, attendance, leave, and hiring.</Typography>
      </div>
      <div className="flex gap-2 flex-wrap">
        {TABS.map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${tab === item ? 'bg-deep-green text-white' : 'bg-white border border-charcoal/10 text-charcoal/60'}`}>
            {item}
          </button>
        ))}
      </div>

      {tab === 'Members' && (
        <div className="space-y-3">
          <AddMemberForm onCreated={() => mutateMembers()} />
          <Button variant="outline" onClick={async () => { await api.post('/people/memberships/reminders'); toast.success('Expiry reminders sent'); }}>Send expiry reminders</Button>
          {(membersData?.memberships || []).length === 0 && (
            <p className="text-sm text-charcoal/45">No members yet. Create a member login above.</p>
          )}
          {(membersData?.memberships || []).map((row: any) => (
            <MemberRow key={row.id} row={row} onDecide={decide} onUpdated={() => mutateMembers()} />
          ))}
        </div>
      )}

      {tab === 'Volunteers' && (
        <VolunteerAdmin rows={volunteersData?.volunteers || []} onDecide={decide} mutate={mutateVolunteers} />
      )}

      {tab === 'Employees' && (
        <EmployeeAdmin rows={employeesData?.employees || []} mutate={mutateEmployees} />
      )}

      {tab === 'Attendance' && (
        <AttendanceAdmin
          rows={attendanceData?.attendance || []}
          employees={employeesData?.employees || []}
          mutate={mutateAttendance}
        />
      )}

      {tab === 'Leave' && (
        <LeaveAdmin
          rows={leaveData?.leave || []}
          employees={employeesData?.employees || []}
          mutate={mutateLeave}
        />
      )}

      {tab === 'Announcements' && (
        <AnnouncementAdmin rows={announcementsData?.announcements || []} mutate={mutateAnnouncements} />
      )}
    </div>
  );
}

function AddMemberForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    membership_type: 'annual',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [lastLogin, setLastLogin] = useState<{ email: string; password: string } | null>(null);

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (form.password && form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/people/memberships/admin', form);
      const password = res.data?.data?.tempPassword || form.password;
      const email = res.data?.data?.loginEmail || form.email;
      setLastLogin(password ? { email, password } : null);
      toast.success(password ? `Member created. Login: ${email}` : 'Member created');
      setForm({ name: '', email: '', phone: '', membership_type: 'annual', password: '' });
      onCreated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not create member login');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-charcoal/5 space-y-3">
      <div>
        <p className="font-bold text-charcoal">Create member login</p>
        <p className="text-xs text-charcoal/50 mt-0.5">Sets email + password so the member can sign in at /login. Leave password blank to auto-generate.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
        <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        <select value={form.membership_type} onChange={(e) => setForm({ ...form, membership_type: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm">
          <option value="annual">Annual</option>
          <option value="student">Student</option>
          <option value="lifetime">Lifetime</option>
        </select>
        <input placeholder="Password (optional)" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
      </div>
      <Button size="sm" disabled={saving} onClick={submit}>{saving ? 'Creating…' : 'Create member + login'}</Button>
      {lastLogin && (
        <div className="text-sm bg-light-green text-deep-green rounded-xl px-3 py-2">
          Portal login created. Email <b>{lastLogin.email}</b> · Password <b>{lastLogin.password}</b>
          <span className="block text-xs text-charcoal/50 mt-1">Copy this now. SMTP may not be configured, so the member might not get an email.</span>
        </div>
      )}
    </div>
  );
}

function MemberRow({ row, onDecide, onUpdated }: { row: any; onDecide: Function; onUpdated: () => void }) {
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveLogin = async () => {
    if (password.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/people/memberships/${row.id}/credentials`, { password: password.trim() });
      toast.success(`Login set for ${row.email}`);
      setPassword('');
      setOpen(false);
      onUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not set password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-charcoal/5 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="font-bold">{row.name} <span className="text-xs font-normal text-charcoal/50">{row.member_no || 'pending'}</span></p>
          <p className="text-sm text-charcoal/50">{row.email} · {row.membership_type} · {row.status}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {row.status === 'pending' && (
            <>
              <Button size="sm" onClick={() => onDecide('memberships', row.id, 'active')}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => onDecide('memberships', row.id, 'rejected')}>Reject</Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>Set login</Button>
          {row.id_card_url && <a className="text-xs font-bold text-deep-green self-center" href={getImageUrl(row.id_card_url)} target="_blank" rel="noreferrer">ID</a>}
          {row.member_no && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await api.post(`/people/memberships/${row.id}/id-card`);
                  toast.success('ID card reissued with current verify URL');
                  onUpdated();
                } catch (error: any) {
                  toast.error(error.response?.data?.message || 'Could not reissue ID');
                }
              }}
            >
              Reissue ID
            </Button>
          )}
        </div>
      </div>
      {open && (
        <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-charcoal/5">
          <input
            type="text"
            placeholder="New portal password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm min-w-[200px]"
          />
          <Button size="sm" disabled={saving} onClick={saveLogin}>{saving ? 'Saving…' : 'Save password'}</Button>
        </div>
      )}
    </div>
  );
}

function LoginBanner({ email, password }: { email: string; password: string }) {
  return (
    <div className="text-sm bg-light-green text-deep-green rounded-xl px-3 py-2">
      Portal login created. Email <b>{email}</b> · Password <b>{password}</b>
      <span className="block text-xs text-charcoal/50 mt-1">Copy this now. SMTP may not be configured, so they might not get an email.</span>
    </div>
  );
}

function SetLogin({ path, email, onUpdated }: { path: string; email: string; onUpdated: () => void }) {
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (password.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await api.post(path, { password: password.trim() });
      toast.success(`Login set for ${email}`);
      setPassword('');
      setOpen(false);
      onUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not set password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>Set login</Button>
      {open && (
        <div className="flex flex-wrap gap-2 items-center mt-3">
          <input type="text" placeholder="New portal password" value={password} onChange={(e) => setPassword(e.target.value)} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm min-w-[200px]" />
          <Button size="sm" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save password'}</Button>
        </div>
      )}
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p className="text-sm text-charcoal/45 px-1">{text}</p>;
}

function VolunteerAdmin({ rows, onDecide, mutate }: { rows: any[]; onDecide: Function; mutate: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', skills: '', availability: 'weekends', password: '' });
  const [title, setTitle] = useState('');
  const [volunteerId, setVolunteerId] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastLogin, setLastLogin] = useState<{ email: string; password: string } | null>(null);

  const create = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/people/volunteers/admin', form);
      const password = res.data?.data?.tempPassword || form.password;
      setLastLogin(password ? { email: res.data?.data?.loginEmail || form.email, password } : null);
      toast.success('Volunteer created');
      setForm({ name: '', email: '', phone: '', skills: '', availability: 'weekends', password: '' });
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not create volunteer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-charcoal/5 space-y-3">
        <div>
          <p className="font-bold text-charcoal">Create volunteer login</p>
          <p className="text-xs text-charcoal/50 mt-0.5">Adds an active volunteer and portal login. Leave password blank to auto-generate.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-2">
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
          <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm">
            <option value="weekends">Weekends</option>
            <option value="weekdays">Weekdays</option>
            <option value="flexible">Flexible</option>
          </select>
          <input placeholder="Password (optional)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        </div>
        <Button size="sm" disabled={saving} onClick={create}>{saving ? 'Creating…' : 'Create volunteer + login'}</Button>
        {lastLogin && <LoginBanner email={lastLogin.email} password={lastLogin.password} />}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-charcoal/5 flex flex-wrap gap-2">
        <select value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm">
          <option value="">Assign to volunteer</option>
          {rows.filter((row) => row.status === 'active').map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
        </select>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm flex-1" />
        <Button size="sm" onClick={async () => {
          if (!volunteerId || !title.trim()) return toast.error('Pick a volunteer and title');
          await api.post(`/people/volunteers/${volunteerId}/assignments`, { title });
          toast.success('Assigned');
          setTitle('');
          mutate();
        }}>Add assignment</Button>
      </div>

      {rows.length === 0 && <EmptyNote text="No volunteers yet. Create one above or approve a public registration." />}
      {rows.map((row) => (
        <div key={row.id} className="bg-white rounded-2xl border border-charcoal/5 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold">{row.name} <span className="text-xs font-normal text-charcoal/50">{row.volunteer_no || 'pending'}</span></p>
              <p className="text-sm text-charcoal/50">{row.email} · {row.skills || '—'} · {row.availability} · {row.status} · {row.hours_total || 0}h</p>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {row.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => onDecide('volunteers', row.id, 'active')}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => onDecide('volunteers', row.id, 'rejected')}>Reject</Button>
                </>
              )}
              <SetLogin path={`/people/volunteers/${row.id}/credentials`} email={row.email} onUpdated={mutate} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmployeeAdmin({ rows, mutate }: { rows: any[]; mutate: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', designation: 'Staff', department: 'Operations', password: '' });
  const [saving, setSaving] = useState(false);
  const [lastLogin, setLastLogin] = useState<{ email: string; password: string } | null>(null);

  const create = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/people/employees', form);
      const password = res.data?.data?.tempPassword || form.password;
      setLastLogin(password ? { email: res.data?.data?.loginEmail || form.email, password } : null);
      toast.success('Staff created');
      setForm({ name: '', email: '', phone: '', designation: 'Staff', department: 'Operations', password: '' });
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not create employee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-charcoal/5 space-y-3">
        <div>
          <p className="font-bold text-charcoal">Create staff login</p>
          <p className="text-xs text-charcoal/50 mt-0.5">Adds an employee and portal login for attendance and leave.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-2">
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Password (optional)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        </div>
        <Button size="sm" disabled={saving} onClick={create}>{saving ? 'Creating…' : 'Create staff + login'}</Button>
        {lastLogin && <LoginBanner email={lastLogin.email} password={lastLogin.password} />}
      </div>
      {rows.length === 0 && <EmptyNote text="No employees yet. Create staff above so attendance and leave can be marked." />}
      {rows.map((row) => (
        <div key={row.id} className="bg-white rounded-2xl border border-charcoal/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-bold">{row.name} · {row.employee_no}</p>
            <p className="text-sm text-charcoal/50">{row.designation} · {row.department} · {row.email}</p>
            {row.welcome_kit_url && <a className="text-xs font-bold text-deep-green" href={getImageUrl(row.welcome_kit_url)} target="_blank" rel="noreferrer">Welcome kit</a>}
          </div>
          <SetLogin path={`/people/employees/${row.id}/credentials`} email={row.email} onUpdated={mutate} />
        </div>
      ))}
    </div>
  );
}

function AttendanceAdmin({ rows, employees, mutate }: { rows: any[]; employees: any[]; mutate: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ employee_id: '', work_date: today });
  const [saving, setSaving] = useState(false);

  const mark = async () => {
    if (!form.employee_id) return toast.error('Select a staff member');
    setSaving(true);
    try {
      const res = await api.post('/people/attendance/admin', form);
      toast.success(res.data?.message || 'Attendance marked');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not mark attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-charcoal/5 space-y-3">
        <div>
          <p className="font-bold text-charcoal">Mark attendance</p>
          <p className="text-xs text-charcoal/50 mt-0.5">Staff can also self check-in at /attendance/check-in.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm min-w-[200px]">
            <option value="">Select staff</option>
            {employees.map((row) => <option key={row.id} value={row.id}>{row.name} · {row.employee_no}</option>)}
          </select>
          <input type="date" value={form.work_date} onChange={(e) => setForm({ ...form, work_date: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
          <Button size="sm" disabled={saving || employees.length === 0} onClick={mark}>{saving ? 'Saving…' : 'Mark present'}</Button>
        </div>
        {employees.length === 0 && <EmptyNote text="Add an employee first, then mark attendance here." />}
      </div>
      <div className="bg-white rounded-3xl border border-charcoal/5 overflow-hidden">
        <div className="p-4"><p className="font-bold">Daily attendance</p></div>
        {rows.length === 0 ? (
          <p className="px-4 pb-6 text-sm text-charcoal/45">No attendance records yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[11px] uppercase text-charcoal/50">
              <tr><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Staff</th><th className="px-3 py-2 text-left">Method</th></tr>
            </thead>
            <tbody>
              {rows.map((row: any) => (
                <tr key={row.id} className="border-t border-charcoal/5">
                  <td className="px-3 py-2">{String(row.work_date).slice(0, 10)}</td>
                  <td className="px-3 py-2">{row.name} · {row.employee_no}</td>
                  <td className="px-3 py-2">{row.check_in_method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function LeaveAdmin({ rows, employees, mutate }: { rows: any[]; employees: any[]; mutate: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ employee_id: '', leave_type: 'casual', from_date: today, to_date: today, reason: '' });
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!form.employee_id) return toast.error('Select a staff member');
    setSaving(true);
    try {
      await api.post('/people/leave/admin', form);
      toast.success('Leave request added');
      setForm({ ...form, reason: '' });
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not add leave');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-charcoal/5 space-y-3">
        <div>
          <p className="font-bold text-charcoal">Add leave request</p>
          <p className="text-xs text-charcoal/50 mt-0.5">Create a request for staff, then approve or reject below.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm">
            <option value="">Select staff</option>
            {employees.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
          </select>
          <select value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm">
            <option value="casual">Casual</option>
            <option value="sick">Sick</option>
            <option value="earned">Earned</option>
          </select>
          <input type="date" value={form.from_date} onChange={(e) => setForm({ ...form, from_date: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
          <input type="date" value={form.to_date} onChange={(e) => setForm({ ...form, to_date: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        </div>
        <Button size="sm" disabled={saving || employees.length === 0} onClick={add}>{saving ? 'Saving…' : 'Add leave'}</Button>
      </div>
      {rows.length === 0 && <EmptyNote text="No leave requests yet." />}
      {rows.map((row: any) => (
        <div key={row.id} className="bg-white rounded-2xl border border-charcoal/5 p-4 flex justify-between gap-3">
          <div>
            <p className="font-bold">{row.name} · {row.leave_type}</p>
            <p className="text-sm text-charcoal/50">{String(row.from_date).slice(0, 10)} → {String(row.to_date).slice(0, 10)} · {row.days} days · {row.status}</p>
            {row.reason && <p className="text-xs text-charcoal/40 mt-1">{row.reason}</p>}
          </div>
          {row.status === 'pending' && (
            <div className="flex gap-2">
              <Button size="sm" onClick={async () => { await api.patch(`/people/leave/${row.id}`, { status: 'approved' }); mutate(); }}>Approve</Button>
              <Button size="sm" variant="outline" onClick={async () => { await api.patch(`/people/leave/${row.id}`, { status: 'rejected' }); mutate(); }}>Reject</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AnnouncementAdmin({ rows, mutate }: { rows: any[]; mutate: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const post = async () => {
    if (!title.trim() || !body.trim()) return toast.error('Title and body are required');
    setSaving(true);
    try {
      await api.post('/people/announcements', { title: title.trim(), body: body.trim() });
      toast.success('Posted');
      setTitle('');
      setBody('');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-charcoal/5 space-y-3">
        <div>
          <p className="font-bold text-charcoal">Post announcement</p>
          <p className="text-xs text-charcoal/50 mt-0.5">Shown on the staff portal for employees.</p>
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border border-charcoal/10 rounded-xl px-3 py-2 text-sm" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message" className="w-full border border-charcoal/10 rounded-xl px-3 py-2 text-sm min-h-[80px]" />
        <Button size="sm" disabled={saving} onClick={post}>{saving ? 'Posting…' : 'Post announcement'}</Button>
      </div>
      {rows.length === 0 && <EmptyNote text="No announcements yet." />}
      {rows.map((row) => (
        <div key={row.id} className="bg-white rounded-2xl p-4 border border-charcoal/5 flex justify-between gap-3">
          <div>
            <p className="font-bold">{row.title}</p>
            <p className="text-sm text-charcoal/60 whitespace-pre-wrap">{row.body}</p>
          </div>
          <Button size="sm" variant="outline" onClick={async () => {
            await api.delete(`/people/announcements/${row.id}`);
            toast.success('Removed');
            mutate();
          }}>Delete</Button>
        </div>
      ))}
    </div>
  );
}
