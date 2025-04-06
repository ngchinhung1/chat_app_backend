import {IsString} from "class-validator";

export class SearchMessageDto {
    @IsString()
    chatId!: string;

    @IsString()
    keyword?: string;
}