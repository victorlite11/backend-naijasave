import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatDto, ChatsContainerDto } from 'src/modules/shared/dto/chat/chat-dto';
import { IdGenerator } from 'src/modules/shared/helpers/id-generator/id-generator';
import { IChatsPayload, OperationFeedback, ConcernedChatResponse } from 'src/modules/shared/interface/shared-interfaces';
import { AdminService } from '../../admin/admin.service';
import { DbMediatorService } from '../../db-mediator/db-mediator.service';
import { EntitiesMediatorService } from '../../entities-mediator/entities-mediator/entities-mediator.service';

@Injectable()
export class ChatMediatorService {
    constructor(
        private dbMediatorService: DbMediatorService,
        private adminService: AdminService,
        private entitiesMediatorService: EntitiesMediatorService
    ) {}

    // concerned is the id of the contributor the message is for
    async insertChat(payload: IChatsPayload): Promise<OperationFeedback> {
        if(!payload.chat) {
            throw new HttpException("Chat is empty", HttpStatus.BAD_REQUEST);
        }

        payload.chat._id = `chat-${IdGenerator.getRand(99999)}`;
        payload.chat.date = new Date().toISOString();

        // check if to is admin or overseer and 
        // update it to admin id or the sender's overseer id  appropriately;
        
        switch (payload.chat.to) {
            case "admin":
                let headAdmin = await this.adminService.getHeadAdmin();
                payload.chat.to = headAdmin._id;
                break;
            case "overseer":
                let fromEntity = await this.entitiesMediatorService.fetchEntity(payload.chat.from);
                payload.chat.to = fromEntity.entity.basicInformation.overseerId
            default:
                break;
        }
        
        // check if there's any document in the chats collection with id of for
        // if not, create the chatContainer, add the chat in the appropriate category
        let chatsContainer = await this.dbMediatorService.fetchChatsContainer({
            for: payload.for
        });

        if(!chatsContainer) {
            let container = new ChatsContainerDto();
            container._id = `chat-container-${IdGenerator.getRand(99999)}`;
            container.for = payload.for;
            container["chats"][payload.category].push(payload.chat);
            try {
                container.name = (await this.entitiesMediatorService.fetchEntity(payload.for)).entity.basicInformation.name;
                // insert this container to db
                return await this.dbMediatorService.insertChatsContainer(container);
            } catch(e: any) {
                container.name = "Anonymous";
                // insert this container to db
                return await this.dbMediatorService.insertChatsContainer(container);
            }
            
        } else {
            // there's chat container for the id provided in for property of the payload
            // just update
            if(payload.category == "admin") {
                return await this.dbMediatorService.updateChatsContainer({
                    for: payload.for
                }, {
                    $push: {
                        "chats.admin": payload.chat
                    }
                });
            } else {
                return await this.dbMediatorService.updateChatsContainer({
                    for: payload.for
                }, {
                    $push: {
                        "chats.overseer": payload.chat
                    }
                });
            }
        }
    }

    async retriveChats(payload: IChatsPayload): Promise<ChatDto[]> {
        let container = await this.dbMediatorService.fetchChatsContainer({for: payload.for});
        if(container) {
            return container["chats"][payload.category];
        } else {
            return [];
        }
        
    }

    async retrieveAllConcernedChats(category: "admin" | "overseer", id: string): Promise<ConcernedChatResponse[]> {
        let chatsContainers: ChatsContainerDto[] = [];
        let retrievedChats: ConcernedChatResponse[] = [];

        if (category == "admin") {
            chatsContainers = await this.dbMediatorService.fetchChatsContainers({
                $or: [
                        {"chats.admin": {$elemMatch: {"to": id}}},
                        {"chats.admin": {$elemMatch: {"from": id}}}
                    ]
            });
        } else {
            chatsContainers = await this.dbMediatorService.fetchChatsContainers({
                $or: [
                        {"chats.overseer": {$elemMatch: {"to": id}}},
                        {"chats.overseer": {$elemMatch: {"from": id}}}
                    ]
            });
        }

        chatsContainers.forEach(async chatsContainer => {
            retrievedChats.push({
                for: chatsContainer.for,
                name: chatsContainer.name!!,
                totalUnreadMessages: category == "admin" ? 
                                                chatsContainer.chats.admin.filter(c => !c.read).length : 
                                                    chatsContainer.chats.overseer.filter(c => !c.read).length
            });
        });

        return retrievedChats;
    }
}
