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
import { User } from "../../modules/user/entities/user.entity";

export enum CommunicationTemplateType {
  TASK_REMINDER = "task_reminder",
  APPOINTMENT_REMINDER = "appointment_reminder",
  FOLLOW_UP = "follow_up",
  WELCOME = "welcome",
  PASSWORD_RESET = "password_reset",
  ENROLLMENT_CONFIRMATION = "enrollment_confirmation",
  PRESENTATION_SCHEDULED = "presentation_scheduled",
  CUSTOM = "custom",
}

export enum NotificationChannel {
  EMAIL = "email",
  SMS = "sms",
  WHATSAPP = "whatsapp",
  PUSH = "push",
  IN_APP = "in_app",
}

@Entity("communication_templates")
@Index(["template_type"])
@Index(["channel"])
@Index(["is_active"])
export class CommunicationTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "template_name", length: 255, nullable: false })
  template_name: string;

  @Column({
    name: "template_type",
    type: "enum",
    enum: CommunicationTemplateType,
    nullable: false,
  })
  template_type: CommunicationTemplateType;

  @Column({ name: "channel", type: "enum", enum: NotificationChannel, nullable: false })
  channel: NotificationChannel;

  @Column({ name: "subject", length: 500, nullable: true })
  subject: string;

  @Column({ name: "body", type: "text", nullable: false })
  body: string;

  @Column({ name: "variables", type: "json", nullable: true })
  variables: any;

  @Column({ name: "is_active", type: "smallint", default: 1 })
  is_active: number;

  @Column({ name: "is_deleted", type: "smallint", default: 0 })
  is_deleted: number;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @Column({ name: "created_by", type: "integer", nullable: true })
  created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  createdByUser: User;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @Column({ name: "modify_at", type: "timestamp", nullable: true })
  modify_at: Date;

  @Column({ name: "modify_by", type: "integer", nullable: true })
  modify_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "modify_by" })
  modifyByUser: User;
}
