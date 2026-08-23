"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.donationController = void 0;
const donation_service_1 = require("./donation.service");
const document_service_1 = require("../documents/document.service");
const response_1 = require("../../utils/response");
const errors_1 = require("../../utils/errors");
const mail_service_1 = require("../../services/mail.service");
exports.donationController = {
    async getPublicStats(req, res, next) {
        try {
            const stats = await donation_service_1.donationService.getPublicStats();
            (0, response_1.sendSuccess)(res, 200, stats, 'Donation stats fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async createDonation(req, res, next) {
        try {
            const userId = req.user?.id || null;
            const donation = await donation_service_1.donationService.createDonation(req.body, userId);
            (0, response_1.sendSuccess)(res, 201, { donation }, 'Donation recorded successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getDonations(req, res, next) {
        try {
            // Admin sees all donations, we pass query filters
            const data = await donation_service_1.donationService.getDonations(req.query);
            (0, response_1.sendSuccess)(res, 200, data, 'Donations fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getMyDonations(req, res, next) {
        try {
            const userId = req.user.id;
            const data = await donation_service_1.donationService.getDonations(req.query, userId);
            (0, response_1.sendSuccess)(res, 200, data, 'Your donations fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getDonationById(req, res, next) {
        try {
            const donation = await donation_service_1.donationService.getDonationById(req.params.id);
            (0, response_1.sendSuccess)(res, 200, { donation }, 'Donation fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async verifyDonation(req, res, next) {
        try {
            const donation = await donation_service_1.donationService.updateDonationStatus(req.params.id, req.body.status, req.body.paymentRef);
            if (req.body.status === 'verified') {
                const receipt = await document_service_1.documentService.generateReceipt(donation.id);
                const updated = await donation_service_1.donationService.getDonationById(donation.id);
                if (updated.guest_pan || updated.guestPan) {
                    try {
                        await document_service_1.documentService.generate80G(donation.id);
                    }
                    catch (error) {
                        console.error('80G auto-generate skipped:', error);
                    }
                }
                void mail_service_1.mailService.sendDonationVerified(updated, receipt?.pdf_url);
            }
            (0, response_1.sendSuccess)(res, 200, { donation }, 'Donation status updated successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteDonation(req, res, next) {
        try {
            await donation_service_1.donationService.deleteDonation(req.params.id);
            res.json({
                status: 'success',
                message: 'Donation deleted successfully'
            });
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError || error instanceof errors_1.AppError) {
                return next(error);
            }
            console.error('Error deleting donation:', error);
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
};
