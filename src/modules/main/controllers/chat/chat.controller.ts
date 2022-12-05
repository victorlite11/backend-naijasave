import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ChatDto } from 'src/modules/shared/dto/chat/chat-dto';
import { AuthenticatedGuard } from 'src/modules/shared/guards/authenticated/authenticated.guard';
import { ConcernedChatsResponse, IChatsPayload, OperationFeedback } from 'src/modules/shared/interface/shared-interfaces';
import { ChatMediatorService } from 'src/modules/shared/services/chat-mediator/chat-mediator/chat-mediator.service';
import { SmsMediatorService } from 'src/modules/shared/services/sms-mediator/sms-mediator/sms-mediator.service';

@Controller('chats')
@UseGuards(AuthenticatedGuard)
export class ChatController {
    constructor(
        private chatsMediatorService: ChatMediatorService
    ) {}

    @Post("retrieve")
    async retrieveChats(@Body() payload: IChatsPayload): Promise<ChatDto[]> {
        this.checkRequiredProperties(payload);
        return await this.chatsMediatorService.retriveChats(payload);
    }

    @Get('retrieve-concerned-chats')
    async retrieveConcernedChats(
        @Query("category") category: "admin" | "overseer",
        @Query("id") id: string
    ): Promise<ConcernedChatsResponse> {
        let retrieved = await this.chatsMediatorService.retrieveAllConcernedChats(category, id);
        let concernedChatsResponse = new ConcernedChatsResponse();
        
        let unreadMessagesForAllConcernedChatResponse = retrieved.map(resp => resp.totalUnreadMessages);
        concernedChatsResponse.totalUnreadMessages = unreadMessagesForAllConcernedChatResponse.reduce((accumulator, current) => {
            return accumulator + current;
        }, 0);

        concernedChatsResponse.concernedChats = retrieved;

        return concernedChatsResponse;
    }

    @Post("insert")
    async insertChat(@Body() payload: IChatsPayload): Promise<OperationFeedback> {
        this.checkRequiredProperties(payload)
        if(!payload.chat) {
            throw new HttpException("No Chat provided", HttpStatus.BAD_REQUEST);
        }
        return await this.chatsMediatorService.insertChat(payload)
    }

    private checkRequiredProperties(payload: IChatsPayload) {
        if(!payload.for) {
            throw new HttpException("No target (for) user provided", HttpStatus.BAD_REQUEST);
        }
        if(!payload.category) {
            throw new HttpException("No category user provided", HttpStatus.BAD_REQUEST);
        }
    }
}
