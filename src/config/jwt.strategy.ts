import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import * as dotenv from 'dotenv';
import {ConfigService} from "@nestjs/config";
import {JwtPayload} from "jsonwebtoken";

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret_key',
        });
    }

    async validate(payload: any): Promise<JwtPayload> {
        return {
            customer_id: payload.sub,
            phone: payload.phone,
        };
    }
}