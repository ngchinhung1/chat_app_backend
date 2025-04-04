"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanguageFromHeaders = getLanguageFromHeaders;
function getLanguageFromHeaders(req) {
    const rawLang = req.headers['language'];
    return Array.isArray(rawLang) ? rawLang[0] : rawLang || 'en';
}
