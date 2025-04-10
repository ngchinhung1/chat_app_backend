import jwt, {JwtPayload} from 'jsonwebtoken';
import dotenv from 'dotenv';
import {AuthenticatedSocket} from "./authenticated-socket.interface";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key';

export function socketAuthMiddleware(socket: AuthenticatedSocket, next: (err?: Error) => void) {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error('Authentication error: No token'));
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload & { customer_id: string };
        if (!decoded.customer_id) {
            return next(new Error('Authentication error: Invalid token payload'));
        }

        socket.user = decoded;
        next();
    } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
    }
}
