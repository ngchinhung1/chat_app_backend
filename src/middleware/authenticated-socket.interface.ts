import { Socket } from 'socket.io';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedSocket extends Socket {
    user: JwtPayload & { customer_id: string };
}