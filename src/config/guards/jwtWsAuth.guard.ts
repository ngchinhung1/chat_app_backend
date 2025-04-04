import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {Socket} from 'socket.io';
import {Reflector} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class JwtWsAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: Socket = context.switchToWs().getClient<Socket>();
        const token = client.handshake.query.token as string;

        if (!token) {
            throw new UnauthorizedException('Missing token');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            client.data = {user: payload}; // attach user data for later use
            return true;
        } catch (err: any) {
            console.error('JWT verification failed:', err.message);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}