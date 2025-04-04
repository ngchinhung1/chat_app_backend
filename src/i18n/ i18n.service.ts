import {Injectable} from '@nestjs/common';
import en from './en.json';
import my from './my.json';
import zh from './zh.json';

type Messages = {
    [lang: string]: {
        [key: string]: string;
    };
};

@Injectable()
export class I18nService {
    private readonly messages: Messages = {
        en,
        my,
        zh,
    };

    getMessage(lang: string | undefined, key: string): string {
        const language = lang ?? 'en';
        return this.messages[language]?.[key] ?? key;
    }
}