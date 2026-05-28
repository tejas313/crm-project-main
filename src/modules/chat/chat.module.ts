import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { ChatController } from "./controllers/chat.controller";
import { ChatService } from "./services/chat.service";
import { GupshupService } from "./services/gupshup.service";
import { ChatGateway } from "./gateway/chat.gateway";
import { ChatMessage } from "./entities/chat-message.entity";
import { Lead } from "../lead/entities/lead.entity";
import { User } from "../user/entities/user.entity";
import { UserSession } from "../user/entities/user-session.entity";
import { ResponseService } from "../../common/response.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, Lead, User, UserSession]),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    GupshupService,
    ChatGateway,
    JwtService,
    ResponseService,
  ],
  exports: [ChatService, GupshupService, ChatGateway],
})
export class ChatModule {}
