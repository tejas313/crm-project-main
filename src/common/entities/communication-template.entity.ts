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
  TASK_REMINDER = "Task reminder",
  APPOINTMENT_REMINDER = "Appointment reminder",
  FOLLOW_UP = "Follow up",
  WELCOME = "Welcome",
  PASSWORD_RESET = "Password reset",
  ENROLLMENT_CONFIRMATION = "Enrollment confirmation",
  PRESENTATION_SCHEDULED = "Presentation scheduled",
  CUSTOM = "Custom",
}

export enum NotificationChannel {
  EMAIL = "Email",
  SMS = "Sms",
  WHATSAPP = "Whatsapp",
  PUSH = "Push",
  IN_APP = "In app",
}

@Entity("communication_templates")
@Index(["template_type"])
@Index(["channel"])
@Index(["is_active"])
export class CommunicationTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "template_name", length: 255 })
  template_name: string;

  @Column({
    name: "template_type",
    type: "enum",
    enum: CommunicationTemplateType,
  })
  template_type: CommunicationTemplateType;

  @Column({ name: "channel", type: "enum", enum: NotificationChannel })
  channel: NotificationChannel;

  @Column({ name: "subject", length: 500, nullable: true })
  subject: string;

  @Column({ name: "body", type: "text" })
  body: string;

  @Column({ name: "variables", type: "json", nullable: true })
  variables: any;

  @Column({ name: "is_active", default: true })
  is_active: boolean;

  @Column({ name: "fk_created_by_user_id" })
  fk_created_by_user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "fk_created_by_user_id" })
  created_by_user: User;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
