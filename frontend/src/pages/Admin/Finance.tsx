import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { fetcher, api } from '@/lib/fetcher';
import { formatCurrency } from '@/utils/formatters';
import { getImageUrl } from '@/utils/getImageUrl';

const TABS = ['Overview', 'Expenses', 'Budgets', 'Audit'] as const;

export function Finance() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const [fy, setFy] = useState(() => {
    const now = new Date();
    const start = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
  });
  const { data: dash } = useSWR(`/finance/dashboard?fy=${fy}`, fetcher);
  const { data: headsData, mutate: mutateHeads } = useSWR('/finance/heads', fetcher);
  const { data: expensesData, mutate: mutateExpenses } = useSWR(`/finance/expenses?fy=${fy}`, fetcher);
  const { data: budgetsData, mutate: mutateBudgets } = useSWR(`/finance/budgets?fy=${fy}`, fetcher);
  const { data: campaignsData } = useSWR('/campaigns?limit=100', fetcher);
  const heads = headsData?.heads || [];
  const expenses = expensesData?.expenses || [];
  const budgets = budgetsData?.budgets || [];
  const campaigns = campaignsData?.campaigns || [];

  const [expenseForm, setExpenseForm] = useState({ head_id: '', amount: '', expense_date: '', description: '', voucher_no: '', campaign_id: '' });
  const [headForm, setHeadForm] = useState({ name: '', type: 'expense', description: '' });
  const [budgetForm, setBudgetForm] = useState({ title: '', allocated: '', campaign_id: '', notes: '' });
  const [ucCampaign, setUcCampaign] = useState('');

  const saveHead = async () => {
    try {
      await api.post('/finance/heads', headForm);
      toast.success('Head added');
      setHeadForm({ name: '', type: 'expense', description: '' });
      mutateHeads();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not add head');
    }
  };

  const saveExpense = async () => {
    try {
      await api.post('/finance/expenses', {
        ...expenseForm,
        head_id: Number(expenseForm.head_id),
        amount: Number(expenseForm.amount),
        campaign_id: expenseForm.campaign_id ? Number(expenseForm.campaign_id) : null,
      });
      toast.success('Expense recorded');
      setExpenseForm({ head_id: '', amount: '', expense_date: '', description: '', voucher_no: '', campaign_id: '' });
      mutateExpenses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not save expense');
    }
  };

  const saveBudget = async () => {
    try {
      await api.post('/finance/budgets', {
        ...budgetForm,
        fy,
        allocated: Number(budgetForm.allocated),
        campaign_id: budgetForm.campaign_id ? Number(budgetForm.campaign_id) : null,
      });
      toast.success('Budget saved');
      setBudgetForm({ title: '', allocated: '', campaign_id: '', notes: '' });
      mutateBudgets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not save budget');
    }
  };

  const downloadAudit = async () => {
    try {
      const res = await api.get(`/finance/audit?fy=${fy}`);
      const pack = res.data?.data;
      const blob = new Blob(
        [`DONATIONS\n${pack.donationCsv}\n\nPAYOUTS\n${pack.payoutCsv}\n\nEXPENSES\n${pack.expenseCsv}`],
        { type: 'text/csv' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-${fy}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export audit pack');
    }
  };

  const generateUc = async () => {
    try {
      const res = await api.post('/finance/utilization', { fy, campaign_id: ucCampaign || undefined });
      const url = res.data?.data?.pdfUrl;
      toast.success('Utilization certificate generated');
      if (url) window.open(getImageUrl(url), '_blank');
    } catch {
      toast.error('Could not generate UC');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">Finance</Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">Monthly trend, utilization, expense heads, budgets, and audit export.</Typography>
        </div>
        <input value={fy} onChange={(e) => setFy(e.target.value)} className="px-3 py-2 rounded-xl border border-charcoal/15 text-sm w-36" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${tab === item ? 'bg-deep-green text-white' : 'bg-white border border-charcoal/10 text-charcoal/60'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Stat title="Income" value={formatCurrency(dash?.income || 0)} />
            <Stat title="Spent" value={formatCurrency(dash?.spent || 0)} />
            <Stat title="Remaining" value={formatCurrency(dash?.remaining || 0)} />
            <Stat title="80G issued" value={String(dash?.eightyGIssued || 0)} />
          </div>
          <div className="bg-white rounded-3xl border border-charcoal/5 p-6">
            <p className="font-bold mb-4">Monthly donation trend</p>
            <div className="grid gap-2">
              {(dash?.monthly || []).map((row: any) => (
                <div key={row.month} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-charcoal/50">{row.month}</span>
                  <div className="flex-1 h-3 bg-fog-gray rounded-full overflow-hidden">
                    <div className="h-full bg-deep-green" style={{ width: `${Math.min(100, (row.total / Math.max(dash?.income || 1, 1)) * 100)}%` }} />
                  </div>
                  <span className="text-sm font-bold w-28 text-right">{formatCurrency(row.total)}</span>
                </div>
              ))}
              {(dash?.monthly || []).length === 0 && <p className="text-sm text-charcoal/40">No verified donations in this FY yet.</p>}
            </div>
            <p className="text-sm text-charcoal/50 mt-4">Utilization {dash?.utilizationPct || 0}% of verified income.</p>
          </div>
        </>
      )}

      {tab === 'Expenses' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-charcoal/5 p-5 space-y-3">
              <p className="font-bold">New expense</p>
              <select value={expenseForm.head_id} onChange={(e) => setExpenseForm({ ...expenseForm, head_id: e.target.value })} className="w-full border border-charcoal/15 rounded-xl px-3 py-2 text-sm">
                <option value="">Select head</option>
                {heads.filter((head: any) => head.type === 'expense').map((head: any) => <option key={head.id} value={head.id}>{head.name}</option>)}
              </select>
              <input type="number" placeholder="Amount" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="w-full border border-charcoal/15 rounded-xl px-3 py-2 text-sm" />
              <input type="date" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} className="w-full border border-charcoal/15 rounded-xl px-3 py-2 text-sm" />
              <select value={expenseForm.campaign_id} onChange={(e) => setExpenseForm({ ...expenseForm, campaign_id: e.target.value })} className="w-full border border-charcoal/15 rounded-xl px-3 py-2 text-sm">
                <option value="">No campaign</option>
                {campaigns.map((campaign: any) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}
              </select>
              <input placeholder="Voucher no" value={expenseForm.voucher_no} onChange={(e) => setExpenseForm({ ...expenseForm, voucher_no: e.target.value })} className="w-full border border-charcoal/15 rounded-xl px-3 py-2 text-sm" />
              <input placeholder="Description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} className="w-full border border-charcoal/15 rounded-xl px-3 py-2 text-sm" />
              <Button onClick={saveExpense}>Record expense</Button>
            </div>
            <div className="bg-white rounded-3xl border border-charcoal/5 p-5 space-y-3">
              <p className="font-bold">Income / expense head</p>
              <input placeholder="Head name" value={headForm.name} onChange={(e) => setHeadForm({ ...headForm, name: e.target.value })} className="w-full border border-charcoal/15 rounded-xl px-3 py-2 text-sm" />
              <select value={headForm.type} onChange={(e) => setHeadForm({ ...headForm, type: e.target.value })} className="w-full border border-charcoal/15 rounded-xl px-3 py-2 text-sm">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <Button variant="outline" onClick={saveHead}>Add head</Button>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-3xl border border-charcoal/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase text-charcoal/50">
                <tr>
                  <th className="px-3 py-3 text-left">Date</th>
                  <th className="px-3 py-3 text-left">Head</th>
                  <th className="px-3 py-3 text-left">Description</th>
                  <th className="px-3 py-3 text-left">Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {expenses.map((row: any) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2">{String(row.expense_date).slice(0, 10)}</td>
                    <td className="px-3 py-2">{row.head_name}</td>
                    <td className="px-3 py-2">{row.description || row.campaign_title || '—'}</td>
                    <td className="px-3 py-2 font-bold">{formatCurrency(row.amount)}</td>
                    <td className="px-3 py-2 text-right">
                      <button className="text-red-600 text-xs font-bold" onClick={async () => { await api.delete(`/finance/expenses/${row.id}`); mutateExpenses(); }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Budgets' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-charcoal/5 p-5 space-y-3">
            <p className="font-bold">New budget line</p>
            <input placeholder="Program / project title" value={budgetForm.title} onChange={(e) => setBudgetForm({ ...budgetForm, title: e.target.value })} className="w-full border border-charcoal/15 rounded-xl px-3 py-2 text-sm" />
            <input type="number" placeholder="Allocated INR" value={budgetForm.allocated} onChange={(e) => setBudgetForm({ ...budgetForm, allocated: e.target.value })} className="w-full border border-charcoal/15 rounded-xl px-3 py-2 text-sm" />
            <select value={budgetForm.campaign_id} onChange={(e) => setBudgetForm({ ...budgetForm, campaign_id: e.target.value })} className="w-full border border-charcoal/15 rounded-xl px-3 py-2 text-sm">
              <option value="">Optional campaign</option>
              {campaigns.map((campaign: any) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}
            </select>
            <Button onClick={saveBudget}>Save budget</Button>
          </div>
          <div className="lg:col-span-2 bg-white rounded-3xl border border-charcoal/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase text-charcoal/50">
                <tr>
                  <th className="px-3 py-3 text-left">Title</th>
                  <th className="px-3 py-3 text-left">Allocated</th>
                  <th className="px-3 py-3 text-left">Spent</th>
                  <th className="px-3 py-3 text-left">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {budgets.map((row: any) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2">{row.title}<div className="text-xs text-charcoal/40">{row.campaign_title || ''}</div></td>
                    <td className="px-3 py-2">{formatCurrency(row.allocated)}</td>
                    <td className="px-3 py-2">{formatCurrency(row.spent)}</td>
                    <td className="px-3 py-2 font-bold">{formatCurrency(row.remaining)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Audit' && (
        <div className="bg-white rounded-3xl border border-charcoal/5 p-6 space-y-4 max-w-2xl">
          <p className="font-bold">Audit period export</p>
          <p className="text-sm text-charcoal/60">Downloads donations, campaign payouts, and expense ledger for FY {fy} as one CSV pack.</p>
          <Button onClick={downloadAudit}>Download audit CSV</Button>
          <div className="border-t border-charcoal/10 pt-4 space-y-3">
            <p className="font-bold">Utilization certificate</p>
            <select value={ucCampaign} onChange={(e) => setUcCampaign(e.target.value)} className="w-full border border-charcoal/15 rounded-xl px-3 py-2 text-sm">
              <option value="">Whole foundation</option>
              {campaigns.map((campaign: any) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}
            </select>
            <Button variant="outline" onClick={generateUc}>Generate UC PDF</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-3xl border border-charcoal/5 p-5">
      <p className="text-xs uppercase tracking-wider text-charcoal/45">{title}</p>
      <p className="text-2xl font-bold text-deep-green mt-1">{value}</p>
    </div>
  );
}
