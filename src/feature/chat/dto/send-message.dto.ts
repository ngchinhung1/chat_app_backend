import {IsOptional, IsString} from 'class-validator';

export class SendMessageDto {
    @IsString()
    chatId!: string;

    @IsString()
    content!: string;

    @IsOptional()
    @IsString()
    voiceUrl?: string;
}