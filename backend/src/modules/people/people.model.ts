import { pool } from '../../config/database';

async function nextSerial(kind: string, prefix: string) {
  const year = new Date().getFullYear();
  const key = `${kind}-${year}`;
  await pool.query(
    `INSERT INTO people_counters (kind, last_no) VALUES (?, 1)
     ON DUPLICATE KEY UPDATE last_no = last_no + 1`,
    [key]
  );
  const [rows] = await pool.query('SELECT last_no FROM people_counters WHERE kind = ?', [key]);
  const serial = String((rows as any[])[0].last_no).padStart(4, '0');
  return `${prefix}-${year}-${serial}`;
}

export const peopleModel = {
  nextMemberNo: () => nextSerial('member', 'KNT-M'),
  nextVolunteerNo: () => nextSerial('volunteer', 'KNT-V'),
  nextEmployeeNo: () => nextSerial('employee', 'KNT-E'),

  async createMembership(row: any) {
    await pool.query(
      `INSERT INTO memberships (id, user_id, name, email, phone, membership_type, fee, payment_ref, screenshot_url, photo_url, kyc_pan, kyc_id_type, kyc_id_number, address, city, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [row.id, row.user_id, row.name, row.email, row.phone, row.membership_type, row.fee, row.payment_ref, row.screenshot_url, row.photo_url, row.kyc_pan, row.kyc_id_type, row.kyc_id_number, row.address, row.city]
    );
  },

  async listMemberships(status?: string) {
    const params: any[] = [];
    let query = 'SELECT * FROM memberships WHERE 1=1';
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows as any[];
  },

  async getMembership(id: string) {
    const [rows] = await pool.query('SELECT * FROM memberships WHERE id = ?', [id]);
    return (rows as any[])[0] || null;
  },

  async getMembershipByMemberNo(memberNo: string) {
    const [rows] = await pool.query('SELECT * FROM memberships WHERE member_no = ?', [memberNo]);
    return (rows as any[])[0] || null;
  },

  async getMembershipByUser(userId: string, email?: string) {
    const [rows] = await pool.query(
      'SELECT * FROM memberships WHERE user_id = ? OR email = ? ORDER BY created_at DESC LIMIT 1',
      [userId, email || '']
    );
    return (rows as any[])[0] || null;
  },

  async updateMembership(id: string, fields: Record<string, any>) {
    const keys = Object.keys(fields);
    if (!keys.length) return;
    await pool.query(
      `UPDATE memberships SET ${keys.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`,
      [...keys.map((key) => fields[key]), id]
    );
  },

  async saveMembershipReceipt(membershipId: string, receiptNo: string, fy: string, amount: number, pdfUrl: string) {
    await pool.query(
      'INSERT INTO membership_receipts (membership_id, receipt_no, fy, amount, pdf_url) VALUES (?, ?, ?, ?, ?)',
      [membershipId, receiptNo, fy, amount, pdfUrl]
    );
  },

  async listMembershipReceipts(membershipId: string) {
    const [rows] = await pool.query(
      'SELECT * FROM membership_receipts WHERE membership_id = ? ORDER BY created_at DESC',
      [membershipId]
    );
    return rows as any[];
  },

  async expiringMemberships(withinDays: number) {
    const [rows] = await pool.query(
      `SELECT * FROM memberships
       WHERE status = 'active' AND membership_type <> 'lifetime'
         AND expires_at IS NOT NULL
         AND expires_at <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
         AND expires_at >= CURDATE()`,
      [withinDays]
    );
    return rows as any[];
  },

  async createVolunteer(row: any) {
    await pool.query(
      `INSERT INTO volunteers (id, user_id, name, email, phone, photo_url, skills, availability, city, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [row.id, row.user_id, row.name, row.email, row.phone, row.photo_url, row.skills, row.availability, row.city, row.message]
    );
  },

  async listVolunteers(status?: string) {
    const params: any[] = [];
    let query = 'SELECT * FROM volunteers WHERE 1=1';
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows as any[];
  },

  async getVolunteer(id: string) {
    const [rows] = await pool.query('SELECT * FROM volunteers WHERE id = ?', [id]);
    return (rows as any[])[0] || null;
  },

  async getVolunteerByNo(volunteerNo: string) {
    const [rows] = await pool.query('SELECT * FROM volunteers WHERE volunteer_no = ?', [volunteerNo]);
    return (rows as any[])[0] || null;
  },

  async getVolunteerByUser(userId: string, email?: string) {
    const [rows] = await pool.query(
      'SELECT * FROM volunteers WHERE user_id = ? OR email = ? ORDER BY created_at DESC LIMIT 1',
      [userId, email || '']
    );
    return (rows as any[])[0] || null;
  },

  async updateVolunteer(id: string, fields: Record<string, any>) {
    const keys = Object.keys(fields);
    if (!keys.length) return;
    await pool.query(
      `UPDATE volunteers SET ${keys.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`,
      [...keys.map((key) => fields[key]), id]
    );
  },

  async addAssignment(row: any) {
    const [result] = await pool.query(
      `INSERT INTO volunteer_assignments (volunteer_id, title, description, scheduled_at, hours)
       VALUES (?, ?, ?, ?, ?)`,
      [row.volunteer_id, row.title, row.description || null, row.scheduled_at || null, row.hours || 0]
    );
    return (result as any).insertId;
  },

  async listAssignments(volunteerId: string) {
    const [rows] = await pool.query(
      'SELECT * FROM volunteer_assignments WHERE volunteer_id = ? ORDER BY created_at DESC',
      [volunteerId]
    );
    return rows as any[];
  },

  async updateAssignment(id: number, fields: Record<string, any>) {
    const keys = Object.keys(fields);
    await pool.query(
      `UPDATE volunteer_assignments SET ${keys.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`,
      [...keys.map((key) => fields[key]), id]
    );
  },

  async addHours(volunteerId: string, workDate: string, hours: number, notes?: string) {
    await pool.query(
      'INSERT INTO volunteer_hours (volunteer_id, work_date, hours, notes) VALUES (?, ?, ?, ?)',
      [volunteerId, workDate, hours, notes || null]
    );
    await pool.query('UPDATE volunteers SET hours_total = hours_total + ? WHERE id = ?', [hours, volunteerId]);
  },

  async listHours(volunteerId: string) {
    const [rows] = await pool.query(
      'SELECT * FROM volunteer_hours WHERE volunteer_id = ? ORDER BY work_date DESC',
      [volunteerId]
    );
    return rows as any[];
  },

  async createEmployee(row: any) {
    await pool.query(
      `INSERT INTO employees (id, user_id, employee_no, designation, department, join_date, photo_url, status, job_application_id, welcome_kit_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [row.id, row.user_id, row.employee_no, row.designation, row.department, row.join_date, row.photo_url, row.job_application_id, row.welcome_kit_url]
    );
    await pool.query('INSERT INTO leave_balances (employee_id) VALUES (?)', [row.id]);
  },

  async listEmployees() {
    const [rows] = await pool.query(
      `SELECT e.*, u.name, u.email, u.mobile
       FROM employees e
       JOIN users u ON u.id = e.user_id
       ORDER BY e.created_at DESC`
    );
    return rows as any[];
  },

  async getEmployee(id: string) {
    const [rows] = await pool.query(
      `SELECT e.*, u.name, u.email, u.mobile
       FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`,
      [id]
    );
    return (rows as any[])[0] || null;
  },

  async getEmployeeByUser(userId: string) {
    const [rows] = await pool.query(
      `SELECT e.*, u.name, u.email, u.mobile
       FROM employees e JOIN users u ON u.id = e.user_id WHERE e.user_id = ?`,
      [userId]
    );
    return (rows as any[])[0] || null;
  },

  async updateEmployee(id: string, fields: Record<string, any>) {
    const keys = Object.keys(fields);
    if (!keys.length) return;
    await pool.query(
      `UPDATE employees SET ${keys.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`,
      [...keys.map((key) => fields[key]), id]
    );
  },

  async addEmployeeDoc(employeeId: string, title: string, fileUrl: string) {
    await pool.query(
      'INSERT INTO employee_docs (employee_id, title, file_url) VALUES (?, ?, ?)',
      [employeeId, title, fileUrl]
    );
  },

  async listEmployeeDocs(employeeId: string) {
    const [rows] = await pool.query(
      'SELECT * FROM employee_docs WHERE employee_id = ? ORDER BY created_at DESC',
      [employeeId]
    );
    return rows as any[];
  },

  async createAnnouncement(title: string, body: string, createdBy?: string) {
    const [result] = await pool.query(
      'INSERT INTO announcements (title, body, created_by) VALUES (?, ?, ?)',
      [title, body, createdBy || null]
    );
    return (result as any).insertId;
  },

  async listAnnouncements() {
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 50');
    return rows as any[];
  },

  async deleteAnnouncement(id: number) {
    const [result] = await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  },

  async markAttendance(employeeId: string, method: 'manual' | 'qr', workDate?: string) {
    const today = workDate || new Date().toISOString().slice(0, 10);
    try {
      await pool.query(
        'INSERT INTO attendance (employee_id, work_date, check_in_method) VALUES (?, ?, ?)',
        [employeeId, today, method]
      );
      return { work_date: today, already: false };
    } catch {
      return { work_date: today, already: true };
    }
  },

  async listAttendance(from?: string, to?: string, employeeId?: string) {
    const params: any[] = [];
    let query = `SELECT a.*, e.employee_no, u.name
      FROM attendance a
      JOIN employees e ON e.id = a.employee_id
      JOIN users u ON u.id = e.user_id
      WHERE 1=1`;
    if (employeeId) {
      query += ' AND a.employee_id = ?';
      params.push(employeeId);
    }
    if (from) {
      query += ' AND a.work_date >= ?';
      params.push(from);
    }
    if (to) {
      query += ' AND a.work_date <= ?';
      params.push(to);
    }
    query += ' ORDER BY a.check_in_at DESC';
    const [rows] = await pool.query(query, params);
    return rows as any[];
  },

  async getLeaveBalance(employeeId: string) {
    const [rows] = await pool.query('SELECT * FROM leave_balances WHERE employee_id = ?', [employeeId]);
    return (rows as any[])[0] || { casual: 12, sick: 8, earned: 15 };
  },

  async updateLeaveBalance(employeeId: string, field: string, delta: number) {
    await pool.query(`UPDATE leave_balances SET ${field} = ${field} + ? WHERE employee_id = ?`, [delta, employeeId]);
  },

  async createLeave(row: any) {
    const [result] = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, from_date, to_date, days, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [row.employee_id, row.leave_type, row.from_date, row.to_date, row.days, row.reason || null]
    );
    return (result as any).insertId;
  },

  async listLeave(employeeId?: string) {
    const params: any[] = [];
    let query = `SELECT l.*, e.employee_no, u.name
      FROM leave_requests l
      JOIN employees e ON e.id = l.employee_id
      JOIN users u ON u.id = e.user_id WHERE 1=1`;
    if (employeeId) {
      query += ' AND l.employee_id = ?';
      params.push(employeeId);
    }
    query += ' ORDER BY l.created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows as any[];
  },

  async getLeave(id: number) {
    const [rows] = await pool.query('SELECT * FROM leave_requests WHERE id = ?', [id]);
    return (rows as any[])[0] || null;
  },

  async updateLeave(id: number, status: string) {
    await pool.query('UPDATE leave_requests SET status = ? WHERE id = ?', [status, id]);
  },
};
