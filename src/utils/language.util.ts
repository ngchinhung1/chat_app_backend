export function getLanguageFromHeaders(req: { headers: Record<string, any> }): string {
    const rawLang = req.headers['language'];
    return Array.isArray(rawLang) ? rawLang[0] : rawLang || 'en';
}