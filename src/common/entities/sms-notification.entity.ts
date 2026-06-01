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

@Entity("sms_notifications")
@Index(["fk_lead_id"])
@Index(["phone"])
@Index(["sms_type"])
@Index(["status"])
@Index(["sent_at"])
export class SmsNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", nullable: true, type: "integer" })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "phone", length: 20, nullable: false })
  phone: string;

  @Column({ name: "message", type: "text", nullable: false })
  message: string;

  @Column({ name: "sms_type", length: 100, nullable: false })
  sms_type: string;

  @Column({ name: "sent_at", type: "timestamp", nullable: true })
  sent_at: Date;

  @Column({ name: "status", length: 50, default: "pending" })
  status: string;

  @Column({ name: "error_message", type: "text", nullable: true })
  error_message: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
