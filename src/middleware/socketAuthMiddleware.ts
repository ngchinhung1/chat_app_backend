import {Socket} from 'socket.io';
import * as jwt from 'jsonwebtoken';

export async function socketAuthMiddleware(
    socket: Socket,
    next: (err?: Error) => void
) {
    const token = socket.handshake.auth?.token;

    if (!token) {
        console.warn('❌ No JWT token found — rejecting connection');
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        socket.data = {user: decoded};
        console.log('✅ JWT decoded for socket:', decoded);
        return next();
    } catch (error) {
        console.error('❌ JWT decode failed:', error);
        return next(new Error('Invalid token'));
    }
}