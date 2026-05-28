import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  HttpCode,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
} from "@nestjs/swagger";
import { Response } from "express";
import { ChatService } from "../services/chat.service";
import { GupshupService } from "../services/gupshup.service";
import { SendMessageDto } from "../dto/send-message.dto";
import {
  GetChatHistoryDto,
  GetConversationListDto,
} from "../dto/chat-filter.dto";
import { AuthGuard } from "../../../guard/auth.guard";
import { ResponseService } from "../../../common/response.service";

@ApiTags("Chat - WhatsApp")
@Controller("chat")
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly gupshupService: GupshupService,
    private readonly responseService: ResponseService
  ) {}

  // ==========================================
  // Agent APIs (Authenticated)
  // ==========================================

  @Post("send-message")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: "authorizations",
    description: "Authorization header",
    required: true,
  })
  @ApiOperation({
    summary: "Send WhatsApp message to customer",
    description:
      "Agent sends a message to a customer (lead) via WhatsApp using Gupshup. The message is stored in the database and delivered via WhatsApp.",
  })
  @ApiResponse({
    status: 200,
    description: "Message sent successfully.",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - validation failed.",
  })
  @ApiResponse({
    status: 404,
    description: "Lead or Agent not found.",
  })
  async sendMessage(
    @Body() dto: SendMessageDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      const agentUserId = req.user.userId;
      console.log('ChatController: sendMessage called by agentUserId:', agentUserId);
      const result = await this.chatService.sendMessage(dto, agentUserId);
      return this.responseService.success(
        res,
        result.message || "SUCCESS",
        result.data
      );
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  @Post("history")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: "authorizations",
    description: "Authorization header",
    required: true,
  })
  @ApiOperation({
    summary: "Get chat history for a lead",
    description:
      "Fetches all WhatsApp messages (inbound & outbound) for a specific lead with pagination.",
  })
  @ApiResponse({
    status: 200,
    description: "Chat history fetched successfully.",
  })
  @ApiResponse({
    status: 404,
    description: "Lead not found.",
  })
  async getChatHistory(
    @Body() dto: GetChatHistoryDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      const agentUserId = req.user.userId;
      const result = await this.chatService.getChatHistory(dto, agentUserId);
      return this.responseService.success(
        res,
        result.message || "SUCCESS",
        result.data
      );
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  @Post("conversations")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: "authorizations",
    description: "Authorization header",
    required: true,
  })
  @ApiOperation({
    summary: "Get conversation list for agent",
    description:
      "Fetches list of all leads that the agent has chatted with, sorted by last message time. Includes unread count.",
  })
  @ApiResponse({
    status: 200,
    description: "Conversation list fetched successfully.",
  })
  async getConversationList(
    @Body() dto: GetConversationListDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      const agentUserId = req.user.userId;
      const result = await this.chatService.getConversationList(
        dto,
        agentUserId
      );
      return this.responseService.success(
        res,
        result.message || "SUCCESS",
        result.data
      );
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  @Post("mark-read/:leadId")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: "authorizations",
    description: "Authorization header",
    required: true,
  })
  @ApiParam({
    name: "leadId",
    description: "Lead ID to mark messages as read for",
    type: Number,
  })
  @ApiOperation({
    summary: "Mark messages as read",
    description:
      "Marks all inbound messages for a specific lead conversation as read.",
  })
  @ApiResponse({
    status: 200,
    description: "Messages marked as read.",
  })
  async markMessagesAsRead(
    @Param("leadId", ParseIntPipe) leadId: number,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      const agentUserId = req.user.userId;
      const result = await this.chatService.markMessagesAsRead(
        leadId,
        agentUserId
      );
      return this.responseService.success(
        res,
        result.message || "SUCCESS",
        result.data
      );
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  // ==========================================
  // Gupshup Webhook Endpoints (No Auth - called by Gupshup)
  // ==========================================

  @Post("webhook/inbound")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Gupshup Inbound Webhook",
    description:
      "Receives inbound WhatsApp messages from customers via Gupshup webhook. This endpoint should be configured as the Gupshup inbound message webhook URL.",
  })
  @ApiResponse({
    status: 200,
    description: "Webhook processed successfully.",
  })
  async handleInboundWebhook(@Body() body: any, @Res() res: Response) {
    try {
      // Gupshup sends different event types
      const eventType = body.type || body.payload?.type;

      if (eventType === "message" || eventType === "message-event") {
        // Handle inbound message from customer
        const result = await this.chatService.handleInboundMessage(body);
        return res.status(HttpStatus.OK).json(result);
      }

      // Return OK for any unhandled event type (Gupshup expects 200)
      return res.status(HttpStatus.OK).json({
        success: true,
        message: `Event type '${eventType}' acknowledged`,
      });
    } catch (error: any) {
      // Always return 200 to Gupshup to avoid retries
      return res.status(HttpStatus.OK).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Post("webhook/status")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Gupshup Status Webhook",
    description:
      "Receives message delivery status updates from Gupshup (sent, delivered, read, failed). This endpoint should be configured as the Gupshup message events webhook URL.",
  })
  @ApiResponse({
    status: 200,
    description: "Status webhook processed successfully.",
  })
  async handleStatusWebhook(@Body() body: any, @Res() res: Response) {
    try {
      const result = await this.chatService.handleStatusUpdate(body);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      // Always return 200 to Gupshup to avoid retries
      return res.status(HttpStatus.OK).json({
        success: false,
        error: error.message,
      });
    }
  }
}
