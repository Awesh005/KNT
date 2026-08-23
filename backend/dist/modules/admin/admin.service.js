"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const database_1 = require("../../config/database");
const job_application_model_1 = require("../job-applications/job-application.model");
exports.adminService = {
    async getNotifications() {
        const [[enquiryCount]] = await database_1.pool.query("SELECT COUNT(*) as total FROM enquiries WHERE status = 'new'");
        const [[donationCount]] = await database_1.pool.query("SELECT COUNT(*) as total FROM donations WHERE status = 'pending'");
        const [[requestCount]] = await database_1.pool.query("SELECT COUNT(*) as total FROM fundraiser_requests WHERE status = 'pending'");
        const applicationCount = await job_application_model_1.jobApplicationModel.countByStatus('new');
        const [recentEnquiries] = await database_1.pool.query("SELECT id, name, email, created_at FROM enquiries WHERE status = 'new' ORDER BY created_at DESC LIMIT 5");
        const [recentDonations] = await database_1.pool.query(`SELECT d.id, COALESCE(d.guest_name, u.name, 'Donor') as name, d.amount, d.created_at
       FROM donations d
       LEFT JOIN users u ON d.donor_id = u.id
       WHERE d.status = 'pending'
       ORDER BY d.created_at DESC LIMIT 5`);
        const [recentApplications] = await database_1.pool.query("SELECT id, name, job_title, created_at FROM job_applications WHERE status = 'new' ORDER BY created_at DESC LIMIT 5");
        const [recentRequests] = await database_1.pool.query("SELECT id, beneficiary_name, created_at FROM fundraiser_requests WHERE status = 'pending' ORDER BY created_at DESC LIMIT 5");
        const items = [
            ...recentEnquiries.map((row) => ({
                type: 'enquiry',
                id: row.id,
                title: `New enquiry from ${row.name}`,
                subtitle: row.email,
                createdAt: row.created_at,
                link: '/admin/enquiries',
            })),
            ...recentDonations.map((row) => ({
                type: 'donation',
                id: row.id,
                title: `Pending donation from ${row.name}`,
                subtitle: `INR ${Number(row.amount).toLocaleString('en-IN')}`,
                createdAt: row.created_at,
                link: '/admin/donations',
            })),
            ...recentApplications.map((row) => ({
                type: 'application',
                id: row.id,
                title: `Job application: ${row.name}`,
                subtitle: row.job_title,
                createdAt: row.created_at,
                link: '/admin/applications',
            })),
            ...recentRequests.map((row) => ({
                type: 'request',
                id: row.id,
                title: `Fundraiser request: ${row.beneficiary_name}`,
                subtitle: 'Awaiting review',
                createdAt: row.created_at,
                link: '/admin/requests',
            })),
        ]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);
        const totalUnread = Number(enquiryCount.total) +
            Number(donationCount.total) +
            Number(requestCount.total) +
            Number(applicationCount);
        return {
            items,
            counts: {
                enquiries: Number(enquiryCount.total),
                donations: Number(donationCount.total),
                requests: Number(requestCount.total),
                applications: Number(applicationCount),
                total: totalUnread,
            },
        };
    },
};
