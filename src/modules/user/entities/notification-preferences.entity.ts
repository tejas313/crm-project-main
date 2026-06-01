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
import { Lead } from "../../lead/entities/lead.entity";
import { User } from "./user.entity";

@Entity("notification_preferences")
@Index(["email_enable"])
@Index(["whatsapp_enable"])
@Index(["sms_enable"])
@Index(["dnd_enabled"])
export class NotificationPreferences {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", unique: true, type: "integer", nullable: false })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "email_enable", default: 0, type: "smallint" })
  email_enable: number;

  @Column({ name: "whatsapp_enable", default: 0, type: "smallint" })
  whatsapp_enable: number;

  @Column({ name: "sms_enable", default: 0, type: "smallint" })
  sms_enable: number;

  @Column({ name: "dnd_enabled", default: 0, type: "smallint" })
  dnd_enabled: number;

  @Column({ name: "reason", type: "text", nullable: true })
  reason: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @Column({ name: "created_by", type: "integer", nullable: true })
  created_by: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "created_by" })
  createdByUser: User;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @Column({ name: "modify_at", type: "timestamp", nullable: true })
  modify_at: Date;

  @Column({ name: "modify_by", type: "integer", nullable: true })
  modify_by: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "modify_by" })
  modifyByUser: User;
}
