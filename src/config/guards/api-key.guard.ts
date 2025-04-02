import {Injectable, CanActivate, ExecutionContext, UnauthorizedException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) {
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['basic-key'];

        if (!apiKey || apiKey !== this.configService.get<string>('JWT_SECRET')) {
            throw new UnauthorizedException('Invalid API Key');
        }
        return true;
    }
}