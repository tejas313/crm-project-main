import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Lead } from "../../modules/lead/entities/lead.entity";

@Entity("whatsapp_notifications")
@Index(["fk_lead_id"])
@Index(["phone"])
@Index(["whatsapp_type"])
@Index(["status"])
@Index(["sent_at"])
export class WhatsAppNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", nullable: true })
  fk_lead_id: number;

  @ManyToOne(() => Lead)
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "phone", length: 20 })
  phone: string;

  @Column({ name: "message", type: "text" })
  message: string;

  @Column({ name: "whatsapp_type", length: 100 })
  whatsapp_type: string;

  @Column({ name: "sent_at", type: "timestamp", nullable: true })
  sent_at: Date;

  @Column({ name: "status", length: 50, default: "pending" })
  status: string;

  @Column({ name: "error_message", type: "text", nullable: true })
  error_message: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
