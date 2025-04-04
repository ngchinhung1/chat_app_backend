"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nService = void 0;
const common_1 = require("@nestjs/common");
const en_json_1 = __importDefault(require("./en.json"));
const my_json_1 = __importDefault(require("./my.json"));
const zh_json_1 = __importDefault(require("./zh.json"));
let I18nService = class I18nService {
    constructor() {
        this.messages = {
            en: en_json_1.default,
            my: my_json_1.default,
            zh: zh_json_1.default,
        };
    }
    getMessage(lang, key) {
        var _a, _b;
        const language = lang !== null && lang !== void 0 ? lang : 'en';
        return (_b = (_a = this.messages[language]) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : key;
    }
};
exports.I18nService = I18nService;
exports.I18nService = I18nService = __decorate([
    (0, common_1.Injectable)()
], I18nService);
