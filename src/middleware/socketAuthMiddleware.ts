import {Socket} from 'socket.io';
import jwt, {JwtPayload} from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key';

export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error('Authentication error: No token'));
    }

    try {
        socket.user = jwt.verify(token, SECRET_KEY) as JwtPayload;
        next();
    } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
    }
}