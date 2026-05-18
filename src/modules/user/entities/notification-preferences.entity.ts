import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("notification_preferences")
export class NotificationPreferences {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_user_id", unique: true, type: "integer" })
  fk_user_id: number;

  @OneToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_user_id" })
  user: User;

  @Column({ name: "email_enabled", default: true, type: "boolean" })
  email_enabled: boolean;

  @Column({ name: "sms_enabled", default: false, type: "boolean" })
  sms_enabled: boolean;

  @Column({ name: "whatsapp_enabled", default: false, type: "boolean" })
  whatsapp_enabled: boolean;

  @Column({ name: "push_enabled", default: true, type: "boolean" })
  push_enabled: boolean;

  @Column({ name: "task_reminders", default: true, type: "boolean" })
  task_reminders: boolean;

  @Column({ name: "appointment_reminders", default: true, type: "boolean" })
  appointment_reminders: boolean;

  @Column({ name: "lead_assignments", default: true, type: "boolean" })
  lead_assignments: boolean;

  @Column({ name: "daily_summary", default: false, type: "boolean" })
  daily_summary: boolean;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
