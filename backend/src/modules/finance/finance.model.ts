import { pool } from '../../config/database';
import { getFyRange, getIndianFY } from '../../utils/fy';

export const financeModel = {
  async getRegister(filters: { from?: string; to?: string; status?: string }) {
    const params: any[] = [];
    let query = `
      SELECT d.id, d.donated_at, d.amount, d.tip_amount, d.payment_mode, d.payment_ref, d.status,
             COALESCE(d.guest_name, u.name) AS donor_name,
             COALESCE(d.guest_email, u.email) AS donor_email,
             COALESCE(d.guest_phone, u.mobile) AS donor_phone,
             d.guest_pan, d.guest_city, d.guest_state,
             c.title AS campaign_title,
             r.receipt_no, r.pdf_url AS receipt_url,
             e.certificate_no, e.pdf_url AS certificate_url
      FROM donations d
      LEFT JOIN users u ON d.donor_id = u.id
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN receipts r ON d.id = r.donation_id
      LEFT JOIN eighty_g_certificates e ON d.id = e.donation_id
      WHERE 1=1
    `;
    if (filters.status) {
      query += ' AND d.status = ?';
      params.push(filters.status);
    }
    if (filters.from) {
      query += ' AND d.donated_at >= ?';
      params.push(filters.from);
    }
    if (filters.to) {
      query += ' AND d.donated_at < DATE_ADD(?, INTERVAL 1 DAY)';
      params.push(filters.to);
    }
    query += ' ORDER BY d.donated_at DESC';
    const [rows] = await pool.query(query, params);
    return rows as any[];
  },

  async getHeads() {
    const [rows] = await pool.query('SELECT * FROM finance_heads ORDER BY type, name');
    return rows as any[];
  },

  async createHead(data: { name: string; type: string; description?: string }) {
    const [result] = await pool.query(
      'INSERT INTO finance_heads (name, type, description) VALUES (?, ?, ?)',
      [data.name, data.type, data.description || null]
    );
    return (result as any).insertId;
  },

  async getExpenses(filters: { from?: string; to?: string; fy?: string }) {
    const params: any[] = [];
    let query = `
      SELECT e.*, h.name AS head_name, h.type AS head_type, c.title AS campaign_title
      FROM expenses e
      JOIN finance_heads h ON h.id = e.head_id
      LEFT JOIN campaigns c ON c.id = e.campaign_id
      WHERE 1=1
    `;
    if (filters.fy) {
      const { from, to } = getFyRange(filters.fy);
      query += ' AND e.expense_date >= ? AND e.expense_date <= ?';
      params.push(from, to);
    } else {
      if (filters.from) {
        query += ' AND e.expense_date >= ?';
        params.push(filters.from);
      }
      if (filters.to) {
        query += ' AND e.expense_date <= ?';
        params.push(filters.to);
      }
    }
    query += ' ORDER BY e.expense_date DESC';
    const [rows] = await pool.query(query, params);
    return rows as any[];
  },

  async createExpense(data: any) {
    const [result] = await pool.query(
      `INSERT INTO expenses (head_id, program_id, campaign_id, amount, expense_date, voucher_no, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.head_id,
        data.program_id || null,
        data.campaign_id || null,
        data.amount,
        data.expense_date,
        data.voucher_no || null,
        data.description || null,
        data.created_by || null,
      ]
    );
    return (result as any).insertId;
  },

  async deleteExpense(id: number) {
    const [result] = await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  },

  async getBudgets(fy?: string) {
    const year = fy || getIndianFY();
    const { from, to } = getFyRange(year);
    const [rows] = await pool.query(
      `SELECT b.*, c.title AS campaign_title
       FROM budgets b
       LEFT JOIN campaigns c ON c.id = b.campaign_id
       WHERE b.fy = ?
       ORDER BY b.title`,
      [year]
    );
    const budgets = rows as any[];
    const result = [];
    for (const row of budgets) {
      let spent = 0;
      if (row.campaign_id) {
        const [[expense]] = await pool.query(
          'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE campaign_id = ? AND expense_date >= ? AND expense_date <= ?',
          [row.campaign_id, from, to]
        ) as any;
        const [[payout]] = await pool.query(
          'SELECT COALESCE(SUM(amount), 0) AS total FROM payouts WHERE campaign_id = ? AND deleted_at IS NULL AND transfer_date >= ? AND transfer_date <= ?',
          [row.campaign_id, from, to]
        ) as any;
        spent = Number(expense.total) + Number(payout.total);
      } else if (row.program_id) {
        const [[expense]] = await pool.query(
          'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE program_id = ? AND expense_date >= ? AND expense_date <= ?',
          [row.program_id, from, to]
        ) as any;
        spent = Number(expense.total);
      } else {
        spent = 0;
      }
      result.push({
        ...row,
        allocated: Number(row.allocated) || 0,
        spent,
        remaining: (Number(row.allocated) || 0) - spent,
      });
    }
    return result;
  },

  async createBudget(data: any) {
    const [result] = await pool.query(
      `INSERT INTO budgets (fy, program_id, campaign_id, title, allocated, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.fy, data.program_id || null, data.campaign_id || null, data.title, data.allocated, data.notes || null]
    );
    return (result as any).insertId;
  },

  async deleteBudget(id: number) {
    const [result] = await pool.query('DELETE FROM budgets WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  },

  async getDashboard(fy?: string) {
    const year = fy || getIndianFY();
    const { from, to } = getFyRange(year);

    const [[donationStats]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
       FROM donations WHERE status = 'verified' AND donated_at >= ? AND donated_at < DATE_ADD(?, INTERVAL 1 DAY)`,
      [from, to]
    ) as any;

    const [[payoutStats]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM payouts
       WHERE deleted_at IS NULL AND transfer_date >= ? AND transfer_date <= ?`,
      [from, to]
    ) as any;

    const [[expenseStats]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE expense_date >= ? AND expense_date <= ?`,
      [from, to]
    ) as any;

    const [[eightyGStats]] = await pool.query(
      `SELECT COUNT(*) AS count FROM eighty_g_certificates e
       JOIN donations d ON d.id = e.donation_id
       WHERE d.donated_at >= ? AND d.donated_at < DATE_ADD(?, INTERVAL 1 DAY)`,
      [from, to]
    ) as any;

    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(donated_at, '%Y-%m') AS month, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
       FROM donations
       WHERE status = 'verified' AND donated_at >= ? AND donated_at < DATE_ADD(?, INTERVAL 1 DAY)
       GROUP BY DATE_FORMAT(donated_at, '%Y-%m')
       ORDER BY month`,
      [from, to]
    );

    const income = Number(donationStats.total) || 0;
    const payouts = Number(payoutStats.total) || 0;
    const expenses = Number(expenseStats.total) || 0;
    const spent = payouts + expenses;

    return {
      fy: year,
      range: { from, to },
      income,
      donationCount: Number(donationStats.count) || 0,
      payouts,
      expenses,
      spent,
      remaining: income - spent,
      utilizationPct: income > 0 ? Math.round((spent / income) * 100) : 0,
      eightyGIssued: Number(eightyGStats.count) || 0,
      monthly: (monthly as any[]).map((row) => ({
        month: row.month,
        total: Number(row.total) || 0,
        count: Number(row.count) || 0,
      })),
    };
  },

  async getAuditPack(from: string, to: string) {
    const donations = await this.getRegister({ from, to, status: 'verified' });
    const [payouts] = await pool.query(
      `SELECT p.id, p.amount, p.transfer_date, p.account_holder, p.transferred_to, p.account_details, c.title AS campaign_title
       FROM payouts p
       JOIN campaigns c ON c.id = p.campaign_id
       WHERE p.deleted_at IS NULL AND p.transfer_date >= ? AND p.transfer_date <= ?
       ORDER BY p.transfer_date`,
      [from, to]
    );
    const expenses = await this.getExpenses({ from, to });
    return { donations, payouts, expenses };
  },

  async getUtilization(filters: { campaign_id?: number; fy?: string }) {
    const year = filters.fy || getIndianFY();
    const { from, to } = getFyRange(year);
    const params: any[] = [from, to];
    let donationWhere = 'd.status = \'verified\' AND d.donated_at >= ? AND d.donated_at < DATE_ADD(?, INTERVAL 1 DAY)';
    let payoutWhere = 'p.deleted_at IS NULL AND p.transfer_date >= ? AND p.transfer_date <= ?';
    let expenseWhere = 'e.expense_date >= ? AND e.expense_date <= ?';
    const extra: any[] = [];

    if (filters.campaign_id) {
      donationWhere += ' AND d.campaign_id = ?';
      payoutWhere += ' AND p.campaign_id = ?';
      expenseWhere += ' AND e.campaign_id = ?';
      extra.push(filters.campaign_id);
    }

    const [[received]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM donations d WHERE ${donationWhere}`,
      [...params, ...extra]
    ) as any;
    const [[paid]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM payouts p WHERE ${payoutWhere}`,
      [from, to, ...extra]
    ) as any;
    const [[spent]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses e WHERE ${expenseWhere}`,
      [from, to, ...extra]
    ) as any;

    let title = 'Foundation-wide utilization';
    if (filters.campaign_id) {
      const [campaigns] = await pool.query('SELECT title FROM campaigns WHERE id = ?', [filters.campaign_id]);
      title = (campaigns as any[])[0]?.title || title;
    }

    const receivedAmt = Number(received.total) || 0;
    const payoutAmt = Number(paid.total) || 0;
    const expenseAmt = Number(spent.total) || 0;
    return {
      fy: year,
      title,
      received: receivedAmt,
      donationCount: Number(received.count) || 0,
      payouts: payoutAmt,
      expenses: expenseAmt,
      utilized: payoutAmt + expenseAmt,
      unspent: receivedAmt - payoutAmt - expenseAmt,
    };
  },
};
