import {IsOptional, IsString} from 'class-validator';

export class SendMessageDto {
    @IsString()
    chat_id!: string;

    @IsString()
    sender_id?: string;

    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    voiceUrl?: string;

    @IsOptional()
    @IsString()
    timestamp?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsString()
    customer_id!: string;

    @IsOptional()
    @IsString()
    read_at?: string;

    @IsString()
    file_type?: string;
}