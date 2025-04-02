import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
    use(req: FastifyRequest, res: FastifyReply, next: () => void) {
        const lang = (req.headers['language'] as string) || 'en';
        (req as any).language = lang;
        next();
    }
}