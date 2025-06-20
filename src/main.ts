import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe, BadRequestException} from '@nestjs/common';
import {I18nService} from "./i18n/ i18n.service";
import {ApiLoggerInterceptor} from "./log/log.interceptor";
import {CustomIoAdapter} from "./types/custom-io.adapter";
import * as express from 'express';
import { join }   from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
    app.useWebSocketAdapter(new CustomIoAdapter(app));
    const i18nService = app.get(I18nService);

    app.useGlobalPipes(
        new ValidationPipe({
            exceptionFactory: (errors) => {
                const messages = errors.map((err) => {
                    const lang = (err.target as any)?.language || 'en';
                    const constraints = err.constraints
                        ? Object.values(err.constraints).map((msg) => {
                            if (msg.includes('country code')) {
                                return i18nService.getMessage(lang, 'COUNTRY_CODE_EMPTY');
                            }
                            if (msg.includes('phone number')) {
                                return i18nService.getMessage(lang, 'PHONE_NUMBER_EMPTY');
                            }
                            return msg;
                        })
                        : [];

                    return {
                        field: err.property,
                        errors: constraints,
                    };
                });
                return new BadRequestException(messages);
            },
            whitelist: true,
            transform: true,
        }),
    );
    app.useGlobalInterceptors(app.get(ApiLoggerInterceptor));

    await app.listen(3000, '0.0.0.0');
    console.log('✅ Server running on http://localhost:3000');
}

bootstrap().then(() => null);
