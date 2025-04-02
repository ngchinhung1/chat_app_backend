import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {Socket} from 'socket.io';
import {JwtPayload} from 'jsonwebtoken';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class JwtWsAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
    }

    canActivate(context: ExecutionContext): boolean {
        const client = context.switchToWs().getClient<Socket & { user?: JwtPayload }>();
        const token = client.handshake.auth?.token;

        if (!token) {
            return false;
        }

        try {
            const decoded = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });
            client.user = {
                customer_id: decoded.sub,
                phone: decoded.phoneNumber,
            };
            return true;
        } catch (err) {
            return false;
        }
    }
}
