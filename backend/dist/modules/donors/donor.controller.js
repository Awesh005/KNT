"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.donorController = void 0;
const donor_service_1 = require("./donor.service");
const response_1 = require("../../utils/response");
exports.donorController = {
    async listDonors(req, res, next) {
        try {
            const donors = await donor_service_1.donorService.listDonors(req.query);
            (0, response_1.sendSuccess)(res, 200, { donors }, 'Donors fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async exportCsv(req, res, next) {
        try {
            const csv = await donor_service_1.donorService.exportCsv(req.query);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="knt-donors.csv"');
            res.send(csv);
        }
        catch (error) {
            next(error);
        }
    },
    async getDonor(req, res, next) {
        try {
            const donor = await donor_service_1.donorService.getDonor(req.params.key);
            (0, response_1.sendSuccess)(res, 200, { donor }, 'Donor fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async addNote(req, res, next) {
        try {
            const user = req.user || {};
            const donor = await donor_service_1.donorService.addNote(req.params.key, req.body, {
                id: user.id,
                name: user.name,
            });
            (0, response_1.sendSuccess)(res, 201, { donor }, 'Note added');
        }
        catch (error) {
            next(error);
        }
    },
    async setTags(req, res, next) {
        try {
            const donor = await donor_service_1.donorService.setTags(req.params.key, req.body.tags || []);
            (0, response_1.sendSuccess)(res, 200, { donor }, 'Tags updated');
        }
        catch (error) {
            next(error);
        }
    },
    async generateStatement(req, res, next) {
        try {
            const result = req.body.email
                ? await donor_service_1.donorService.emailAnnualStatement(req.params.key, req.body.fy)
                : await donor_service_1.donorService.generateAnnualStatement(req.params.key, req.body.fy);
            (0, response_1.sendSuccess)(res, 201, result, req.body.email ? 'Statement emailed' : 'Statement generated');
        }
        catch (error) {
            next(error);
        }
    },
    async emailAllStatements(req, res, next) {
        try {
            const result = await donor_service_1.donorService.emailAllStatements(req.body.fy);
            (0, response_1.sendSuccess)(res, 200, result, 'Annual statements processed');
        }
        catch (error) {
            next(error);
        }
    },
};
