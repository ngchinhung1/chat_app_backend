import {IsOptional, IsString} from 'class-validator';

export class SendMessageDto {
    @IsString()
    conversationId!: string;

    @IsString()
    senderCustomerId!: string;

    @IsString()
    receiverCustomerId!: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    send_by?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsString()
    file_type!: string;

    @IsOptional()
    @IsString()
    fileUrl?: string;
}