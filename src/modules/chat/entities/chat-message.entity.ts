import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Lead } from "../../lead/entities/lead.entity";

export enum MessageDirection {
  INBOUND = "inbound", // Customer → Agent (via Gupshup webhook)
  OUTBOUND = "outbound", // Agent → Customer (via Gupshup API)
}

export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
  RECEIVED = "received",
}

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  DOCUMENT = "document",
  AUDIO = "audio",
  VIDEO = "video",
  LOCATION = "location",
  TEMPLATE = "template",
}

@Entity("chat_messages")
@Index(["fk_lead_id"])
@Index(["fk_agent_id"])
@Index(["agent_phone"])
@Index(["customer_phone"])
@Index(["direction"])
@Index(["gupshup_message_id"])
@Index(["created_at"])
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  // Lead association
  @Column({ name: "fk_lead_id", type: "integer", nullable: true })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  // Agent association
  @Column({ name: "fk_agent_id", type: "integer", nullable: true })
  fk_agent_id: number;

  @ManyToOne(() => User, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_agent_id" })
  agent: User;

  // Phone numbers
  @Column({ name: "agent_phone", type: "varchar", length: 20 })
  agent_phone: string;

  @Column({ name: "customer_phone", type: "varchar", length: 20 })
  customer_phone: string;

  // Message content
  @Column({ name: "message", type: "text" })
  message: string;

  @Column({
    name: "message_type",
    type: "enum",
    enum: MessageType,
    default: MessageType.TEXT,
  })
  message_type: MessageType;

  // Direction: inbound (customer→agent) or outbound (agent→customer)
  @Column({
    name: "direction",
    type: "enum",
    enum: MessageDirection,
  })
  direction: MessageDirection;

  // Message status tracking
  @Column({
    name: "status",
    type: "enum",
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  // Gupshup tracking
  @Column({
    name: "gupshup_message_id",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  gupshup_message_id: string;

  // Media URL (for image, document, audio, video)
  @Column({ name: "media_url", type: "varchar", length: 500, nullable: true })
  media_url: string;

  // Media caption
  @Column({ name: "media_caption", type: "text", nullable: true })
  media_caption: string;

  // Error details if message failed
  @Column({ name: "error_message", type: "text", nullable: true })
  error_message: string;

  // Conversation context - to group messages in a conversation
  @Column({
    name: "conversation_id",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  conversation_id: string;

  @Column({ name: "is_deleted", type: "smallint", width: 6, default: 0 })
  is_deleted: number;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
