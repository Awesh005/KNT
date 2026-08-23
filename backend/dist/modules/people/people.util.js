"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEMBERSHIP_FEES = void 0;
exports.saveDataUrl = saveDataUrl;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function saveDataUrl(dataUrl, folder, prefix) {
    if (!dataUrl || !dataUrl.startsWith('data:'))
        return null;
    const match = dataUrl.match(/^data:([\w/+.-]+);base64,(.+)$/);
    if (!match)
        return null;
    const mime = match[1];
    const ext = mime.includes('png') ? 'png' : mime.includes('pdf') ? 'pdf' : mime.includes('jpeg') ? 'jpg' : 'jpg';
    const dir = path_1.default.join(process.cwd(), 'uploads', folder);
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
    const fileName = `${prefix}-${Date.now()}.${ext}`;
    fs_1.default.writeFileSync(path_1.default.join(dir, fileName), Buffer.from(match[2], 'base64'));
    return `/uploads/${folder}/${fileName}`;
}
exports.MEMBERSHIP_FEES = {
    annual: 1100,
    student: 500,
    lifetime: 11000,
};
