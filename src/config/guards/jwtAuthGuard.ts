import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {Socket} from 'socket.io';
import {JwtPayload} from "jsonwebtoken";


@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(private jwtService: JwtService) {
    }

    canActivate(context: ExecutionContext): boolean {
        const client = context.switchToWs().getClient<Socket & { user?: JwtPayload }>();
        const token = client.handshake.auth?.token;

        try {
            const decoded = this.jwtService.verify(token) as any;
            client.user = {
                customer_id: decoded.sub,
                phone: decoded.phone,
            };
            return true;
        } catch (e) {
            return false;
        }
    }
}