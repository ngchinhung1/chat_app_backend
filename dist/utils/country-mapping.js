"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountryNameByCode = getCountryNameByCode;
function getCountryNameByCode(code) {
    const countryMap = {
        '60': 'MY', // Malaysia
        '65': 'SG', // Singapore
        '66': 'TH', // Thailand
        '62': 'ID', // Indonesia
        '63': 'PH', // Philippines
        '84': 'VN', // Vietnam
        '886': 'TW', // Taiwan
        '81': 'JP', // Japan
        '82': 'KR', // South Korea
        '852': 'HK', // Hong Kong
        '853': 'MO', // Macau
        '86': 'CN', // China
        '91': 'IN', // India
        '971': 'AE', // UAE
        '44': 'GB', // United Kingdom
        '1': 'US', // USA & Canada
        '7': 'RU', // Russia
        '33': 'FR', // France
        '49': 'DE', // Germany
        '39': 'IT', // Italy
        '34': 'ES', // Spain
        '61': 'AU', // Australia
        '64': 'NZ', // New Zealand
        '94': 'LK', // Sri Lanka
        '880': 'BD', // Bangladesh
        '92': 'PK', // Pakistan
        '373': 'MD', // Moldova
        '372': 'EE', // Estonia
        '48': 'PL', // Poland
    };
    return countryMap[code] || 'MY'; // Default to MY if not found
}
