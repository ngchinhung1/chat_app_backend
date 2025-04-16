export class ChatListDto {
    id!: string;
    conversationId!: string;
    customerId!: string;
    chatType!: string; // 'private' or 'group'
    title?: string; // Only for group chat; for private, the frontend will determine the title.
    firstName?: string;
    lastName?: string;
    countryCode?: string;
    phoneNumber?: string;
    lastMessage?: string;
    updatedAt!: Date;
    unreadCount!: number;
}