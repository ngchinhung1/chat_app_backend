"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = socketAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key';
function socketAuthMiddleware(socket, next) {
    var _a;
    const token = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token;
    if (!token) {
        return next(new Error('Authentication error: No token'));
    }
    try {
        socket.user = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        next();
    }
    catch (err) {
        return next(new Error('Authentication error: Invalid token'));
    }
}
