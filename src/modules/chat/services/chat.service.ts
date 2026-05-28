import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  ChatMessage,
  MessageDirection,
  MessageStatus,
  MessageType,
} from "../entities/chat-message.entity";
import { Lead } from "../../lead/entities/lead.entity";
import { User } from "../../user/entities/user.entity";
import { GupshupService } from "./gupshup.service";
import { ChatGateway } from "../gateway/chat.gateway";
import { SendMessageDto } from "../dto/send-message.dto";
import {
  GetChatHistoryDto,
  GetConversationListDto,
} from "../dto/chat-filter.dto";

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly gupshupService: GupshupService,
    private readonly chatGateway: ChatGateway
  ) {}

  /**
   * Agent sends a message to customer via WhatsApp (Gupshup)
   */
  async sendMessage(
    dto: SendMessageDto,
    agentUserId: number
  ): Promise<{ message: string; data: any }> {
    // 1. Validate lead exists
    const lead = await this.leadRepository.findOne({
      where: { id: dto.lead_id, is_deleted: 0 },
    });

    if (!lead) {
      throw new NotFoundException("Lead not found");
    }

    if (!lead.phone) {
      throw new BadRequestException(
        "Lead does not have a phone number for WhatsApp messaging"
      );
    }

    // 2. Get agent details
    const agent = await this.userRepository.findOne({
      where: { id: agentUserId },
    });

    if (!agent) {
      throw new NotFoundException("Agent not found");
    }

    // 3. Format customer phone with country code
    const customerPhone = lead.phone;

    const agentPhone = agent.phone || this.gupshupService.getSourceNumber();

    // 4. Send message via Gupshup
    const messageType = dto.message_type || MessageType.TEXT;
    let gupshupResponse: any;

    if (messageType === MessageType.TEXT) {
      gupshupResponse = await this.gupshupService.sendTextMessage(
        customerPhone,
        dto.message
      );
    } else if (messageType === MessageType.IMAGE && dto.media_url) {
      gupshupResponse = await this.gupshupService.sendImageMessage(
        customerPhone,
        dto.media_url,
        dto.media_caption
      );
    } else if (messageType === MessageType.DOCUMENT && dto.media_url) {
      gupshupResponse = await this.gupshupService.sendDocumentMessage(
        customerPhone,
        dto.media_url,
        dto.media_caption
      );
    } else {
      gupshupResponse = await this.gupshupService.sendTextMessage(
        customerPhone,
        dto.message
      );
    }

    // 5. Save message to database
    const chatMessage = this.chatMessageRepository.create({
      fk_lead_id: lead.id,
      fk_agent_id: agentUserId,
      agent_phone: agentPhone,
      customer_phone: customerPhone,
      message: dto.message || dto.media_caption || "",
      message_type: messageType,
      direction: MessageDirection.OUTBOUND,
      status: gupshupResponse.success
        ? MessageStatus.SENT
        : MessageStatus.FAILED,
      gupshup_message_id: gupshupResponse.messageId || null,
      media_url: dto.media_url || null,
      media_caption: dto.media_caption || null,
      error_message: gupshupResponse.error || null,
      conversation_id: `lead_${lead.id}`,
    });

    const savedMessage = await this.chatMessageRepository.save(chatMessage);

    // 6. Emit Socket.IO event for real-time update on agent panel
    console.log(
      `ChatService: sendMessage - Emitting to User ID: ${agentUserId} (User: ${agent.first_name})`
    );
    this.logger.log(
      `Emitting new_message to gateway for agentUserId: ${agentUserId}`
    );
    this.chatGateway.emitNewMessage(agentUserId, {
      id: savedMessage.id,
      lead_id: lead.id,
      lead_name: lead.fullName,
      agent_id: agentUserId,
      agent_name: `${agent.first_name || ""} ${agent.last_name || ""}`.trim(),
      agent_phone: agentPhone,
      customer_phone: customerPhone,
      message: savedMessage.message,
      message_type: savedMessage.message_type,
      direction: savedMessage.direction,
      status: savedMessage.status,
      media_url: savedMessage.media_url,
      media_caption: savedMessage.media_caption,
      gupshup_message_id: savedMessage.gupshup_message_id,
      created_at: savedMessage.created_at,
    });

    if (!gupshupResponse.success) {
      this.logger.warn(
        `Message saved but WhatsApp delivery failed: ${gupshupResponse.error}`
      );
    }

    return {
      message: gupshupResponse.success
        ? "Message sent successfully"
        : "Message saved but WhatsApp delivery failed",
      data: {
        id: savedMessage.id,
        status: savedMessage.status,
        gupshup_message_id: savedMessage.gupshup_message_id,
        error: gupshupResponse.error || null,
      },
    };
  }

  /**
   * Handle inbound message from customer via Gupshup webhook
   */
  async handleInboundMessage(webhookBody: any): Promise<any> {
    const parsed = this.gupshupService.parseInboundWebhook(webhookBody);

    if (!parsed) {
      this.logger.warn("Could not parse inbound webhook payload");
      return { success: false, error: "Invalid webhook payload" };
    }

    const { senderPhone, message, messageType, mediaUrl, gupshupMessageId } =
      parsed;

    // 1. Find lead by phone number
    const cleanPhone = this.cleanPhoneNumber(senderPhone);
    const lead = await this.leadRepository.findOne({
      where: { phone: cleanPhone, is_deleted: 0 },
    });

    if (!lead) {
      this.logger.warn(
        `Inbound message from unknown phone: ${senderPhone}. No matching lead found.`
      );
      // Still save the message with null lead
    }

    // 2. Find assigned agent for the lead
    let agentId: number = null;
    let agentPhone = this.gupshupService.getSourceNumber();
    let agentName = "Unassigned";

    if (lead && lead.fk_owner_id) {
      const agent = await this.userRepository.findOne({
        where: { id: lead.fk_owner_id },
      });
      if (agent) {
        agentId = agent.id;
        agentPhone = agent.phone || agentPhone;
        agentName = `${agent.first_name || ""} ${agent.last_name || ""}`.trim();
      }
    }

    // 3. Map message type
    const msgType = this.mapMessageType(messageType);

    // 4. Save message to database
    const chatMessage = this.chatMessageRepository.create({
      fk_lead_id: lead ? lead.id : null,
      fk_agent_id: agentId,
      agent_phone: agentPhone,
      customer_phone: senderPhone,
      message: message || "",
      message_type: msgType,
      direction: MessageDirection.INBOUND,
      status: MessageStatus.RECEIVED,
      gupshup_message_id: gupshupMessageId,
      media_url: mediaUrl || null,
      conversation_id: lead ? `lead_${lead.id}` : `phone_${cleanPhone}`,
    });

    const savedMessage = await this.chatMessageRepository.save(chatMessage);

    // 5. Emit Socket.IO event for real-time update on agent panel
    if (agentId) {
      console.log(`ChatService: handleInboundMessage - Emitting to User ID: ${agentId}`);
      this.logger.log(`Emitting inbound new_message to gateway for agentId: ${agentId}`);
      this.chatGateway.emitNewMessage(agentId, {
        id: savedMessage.id,
        lead_id: lead ? lead.id : null,
        lead_name: lead ? lead.fullName : "Unknown",
        agent_id: agentId,
        agent_name: agentName,
        agent_phone: agentPhone,
        customer_phone: senderPhone,
        message: savedMessage.message,
        message_type: savedMessage.message_type,
        direction: savedMessage.direction,
        status: savedMessage.status,
        media_url: savedMessage.media_url,
        gupshup_message_id: savedMessage.gupshup_message_id,
        created_at: savedMessage.created_at,
      });
    }

    // Also emit to a general channel for unassigned messages
    this.chatGateway.emitInboundMessage({
      id: savedMessage.id,
      lead_id: lead ? lead.id : null,
      lead_name: lead ? lead.fullName : "Unknown",
      customer_phone: senderPhone,
      message: savedMessage.message,
      message_type: savedMessage.message_type,
      agent_id: agentId,
      created_at: savedMessage.created_at,
    });

    this.logger.log(
      `Inbound message saved. ID: ${savedMessage.id}, From: ${senderPhone}`
    );

    return { success: true, messageId: savedMessage.id };
  }

  /**
   * Handle message status update from Gupshup webhook
   */
  async handleStatusUpdate(webhookBody: any): Promise<any> {
    const parsed = this.gupshupService.parseStatusWebhook(webhookBody);

    if (!parsed) {
      return { success: false, error: "Invalid status webhook payload" };
    }

    const { gupshupMessageId, status, errorMessage } = parsed;

    if (!gupshupMessageId) {
      return { success: false, error: "No message ID in status update" };
    }

    // Find the message by gupshup_message_id
    const chatMessage = await this.chatMessageRepository.findOne({
      where: { gupshup_message_id: gupshupMessageId },
    });

    if (!chatMessage) {
      this.logger.warn(
        `Status update for unknown message ID: ${gupshupMessageId}`
      );
      return { success: false, error: "Message not found" };
    }

    // Map Gupshup status to our MessageStatus
    const mappedStatus = this.mapGupshupStatus(status);
    chatMessage.status = mappedStatus;

    if (errorMessage) {
      chatMessage.error_message = errorMessage;
    }

    await this.chatMessageRepository.save(chatMessage);

    // Emit status update via Socket.IO
    if (chatMessage.fk_agent_id) {
      this.chatGateway.emitMessageStatusUpdate(chatMessage.fk_agent_id, {
        message_id: chatMessage.id,
        gupshup_message_id: gupshupMessageId,
        status: mappedStatus,
        lead_id: chatMessage.fk_lead_id,
      });
    }

    return { success: true };
  }

  /**
   * Get chat history for a specific lead
   */
  async getChatHistory(
    dto: GetChatHistoryDto,
    agentUserId: number
  ): Promise<{ message: string; data: any }> {
    const lead = await this.leadRepository.findOne({
      where: { id: dto.lead_id, is_deleted: 0 },
    });

    if (!lead) {
      throw new NotFoundException("Lead not found");
    }

    const page = dto.page || 1;
    const limit = dto.limit || 50;
    const skip = (page - 1) * limit;

    const [messages, total] = await this.chatMessageRepository.findAndCount({
      where: {
        fk_lead_id: dto.lead_id,
        is_deleted: 0,
      },
      order: { created_at: "ASC" },
      skip,
      take: limit,
      relations: ["agent"],
    });

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      message: msg.message,
      message_type: msg.message_type,
      direction: msg.direction,
      status: msg.status,
      agent_id: msg.fk_agent_id,
      agent_name: msg.agent
        ? `${msg.agent.first_name || ""} ${msg.agent.last_name || ""}`.trim()
        : null,
      agent_phone: msg.agent_phone,
      customer_phone: msg.customer_phone,
      media_url: msg.media_url,
      media_caption: msg.media_caption,
      gupshup_message_id: msg.gupshup_message_id,
      created_at: msg.created_at,
    }));

    return {
      message: "Chat history fetched successfully",
      data: {
        lead_id: lead.id,
        lead_name: lead.fullName,
        lead_phone: lead.phone,
        messages: formattedMessages,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  /**
   * Get conversation list for an agent (all leads with chat)
   */
  async getConversationList(
    dto: GetConversationListDto,
    agentUserId: number
  ): Promise<{ message: string; data: any }> {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.chatMessageRepository
      .createQueryBuilder("cm")
      .select("cm.fk_lead_id", "lead_id")
      .addSelect("MAX(cm.created_at)", "last_message_at")
      .addSelect("MAX(cm.id)", "last_message_id")
      .innerJoin("leads", "l", "l.id = cm.fk_lead_id")
      .where("cm.fk_agent_id = :agentId", { agentId: agentUserId })
      .andWhere("cm.is_deleted = 0")
      .groupBy("cm.fk_lead_id")
      .orderBy("last_message_at", "DESC")
      .offset(skip)
      .limit(limit);

    if (dto.search) {
      queryBuilder.andWhere(
        "(l.phone LIKE :search OR l.first_name LIKE :search OR l.last_name LIKE :search)",
        { search: `%${dto.search}%` }
      );
    }

    const conversations = await queryBuilder.getRawMany();

    // Get total count
    const countQuery = this.chatMessageRepository
      .createQueryBuilder("cm")
      .select("COUNT(DISTINCT cm.fk_lead_id)", "count")
      .where("cm.fk_agent_id = :agentId", { agentId: agentUserId })
      .andWhere("cm.is_deleted = 0");

    if (dto.search) {
      countQuery
        .innerJoin("leads", "l", "l.id = cm.fk_lead_id")
        .andWhere(
          "(l.phone LIKE :search OR l.first_name LIKE :search OR l.last_name LIKE :search)",
          { search: `%${dto.search}%` }
        );
    }

    const totalResult = await countQuery.getRawOne();
    const total = parseInt(totalResult?.count || "0", 10);

    // Enrich with lead details and last message
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv: any) => {
        const lead = await this.leadRepository.findOne({
          where: { id: conv.lead_id },
        });

        const lastMessage = await this.chatMessageRepository.findOne({
          where: { id: conv.last_message_id },
        });

        // Count unread inbound messages
        const unreadCount = await this.chatMessageRepository.count({
          where: {
            fk_lead_id: conv.lead_id,
            fk_agent_id: agentUserId,
            direction: MessageDirection.INBOUND,
            status: MessageStatus.RECEIVED,
            is_deleted: 0,
          },
        });

        return {
          lead_id: conv.lead_id,
          lead_name: lead ? lead.fullName : "Unknown",
          lead_phone: lead ? lead.phone : "",
          last_message: lastMessage ? lastMessage.message : "",
          last_message_type: lastMessage ? lastMessage.message_type : "",
          last_message_direction: lastMessage ? lastMessage.direction : "",
          last_message_at: conv.last_message_at,
          unread_count: unreadCount,
        };
      })
    );

    return {
      message: "Conversation list fetched successfully",
      data: {
        conversations: enrichedConversations,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  /**
   * Mark messages as read for a lead conversation
   */
  async markMessagesAsRead(
    leadId: number,
    agentUserId: number
  ): Promise<{ message: string; data: any }> {
    const result = await this.chatMessageRepository.update(
      {
        fk_lead_id: leadId,
        fk_agent_id: agentUserId,
        direction: MessageDirection.INBOUND,
        status: MessageStatus.RECEIVED,
        is_deleted: 0,
      },
      { status: MessageStatus.READ }
    );

    return {
      message: "Messages marked as read",
      data: { updated_count: result.affected || 0 },
    };
  }

  /**
   * Format phone number with country code for Gupshup
   * Gupshup expects: 919876543210 (country code without + and then number)
   */
  private formatPhoneNumber(phone: string, countryCode: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, "");
    let code = countryCode.replace(/\D/g, "");

    // If phone already starts with country code, return as is
    if (cleaned.startsWith(code)) {
      return cleaned;
    }

    // Remove leading 0 if present
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }

    return `${code}${cleaned}`;
  }

  /**
   * Clean phone number - extract just the national number
   */
  private cleanPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, "");

    // Remove country code (91 for India) if present
    if (cleaned.length > 10 && cleaned.startsWith("91")) {
      cleaned = cleaned.substring(2);
    }

    return cleaned;
  }

  /**
   * Map Gupshup message type to our MessageType enum
   */
  private mapMessageType(gupshupType: string): MessageType {
    const typeMap: Record<string, MessageType> = {
      text: MessageType.TEXT,
      image: MessageType.IMAGE,
      document: MessageType.DOCUMENT,
      audio: MessageType.AUDIO,
      video: MessageType.VIDEO,
      location: MessageType.LOCATION,
    };

    return typeMap[gupshupType?.toLowerCase()] || MessageType.TEXT;
  }

  /**
   * Map Gupshup status to our MessageStatus
   */
  private mapGupshupStatus(gupshupStatus: string): MessageStatus {
    const statusMap: Record<string, MessageStatus> = {
      sent: MessageStatus.SENT,
      delivered: MessageStatus.DELIVERED,
      read: MessageStatus.READ,
      failed: MessageStatus.FAILED,
      enqueued: MessageStatus.SENT,
    };

    return statusMap[gupshupStatus?.toLowerCase()] || MessageStatus.SENT;
  }
}
