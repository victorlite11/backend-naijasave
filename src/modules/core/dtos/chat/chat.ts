export class ChatsContainerDto {
    _id?: string;
    for: string; // id of the contributor;
    name?: string;
    chats: ChatCategoryDto = new ChatCategoryDto();
}

// this holds the category of the chats,
// the contributor chats can be directed to either overseer or head admin
export class ChatCategoryDto {
    admin: ChatDto[] = [];
    overseer: ChatDto[] = [];
}

export class ChatDto {
    _id?: string;
    read: boolean = false;
    message: string;
    from: string; // id of who sent it;
    to: string | "overseer" | "admin"; // id of the receiver;
    date?: string;
}
