"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndianFY = getIndianFY;
exports.getFyRange = getFyRange;
exports.normalizeDonorKey = normalizeDonorKey;
function getIndianFY(dateInput) {
    const date = dateInput ? new Date(dateInput) : new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const startYear = month >= 3 ? year : year - 1;
    return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
}
function getFyRange(fy) {
    const startYear = parseInt(fy.split('-')[0], 10);
    if (Number.isNaN(startYear)) {
        return getFyRange(getIndianFY());
    }
    return {
        from: `${startYear}-04-01`,
        to: `${startYear + 1}-03-31`,
        label: `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`,
    };
}
function normalizeDonorKey(email) {
    return String(email || '').trim().toLowerCase();
}
