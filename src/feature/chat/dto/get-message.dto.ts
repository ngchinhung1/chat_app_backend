export class GetMessagesDto {
    conversationId!: string;
    cursor?: string; // optional ISO timestamp string - only return messages with timestamp < cursor
    limit?: number;  // default limit can be set (e.g. 20)
}