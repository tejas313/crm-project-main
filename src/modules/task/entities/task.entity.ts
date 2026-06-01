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
import { User } from "../../user/entities/user.entity";

export enum TaskStatus {
  PENDING = "pending",
  OVERDUE = "overdue",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TaskType {
  CALL = "call",
  FOLLOW_UP = "follow_up",
  APPOINTMENT = "appointment",
  PRESENTATION = "presentation",
  GENERAL = "general",
}

@Entity("tasks")
@Index(["fk_lead_id"])
@Index(["fk_owner_id"])
@Index(["status"])
@Index(["scheduled_at"])
@Index(["is_deleted"])
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", type: "integer", nullable: false })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "fk_owner_id", type: "integer", nullable: false })
  fk_owner_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_owner_id" })
  owner: User;

  @Column({ length: 255, nullable: false })
  subject: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: "scheduled_at", type: "timestamp", nullable: false })
  scheduled_at: Date;

  @Column({ name: "due_date", type: "timestamp", nullable: true })
  due_date: Date;

  @Column({ name: "reminder_at", type: "timestamp", nullable: true })
  reminder_at: Date;

  @Column({ name: "reminder_sent_at", type: "timestamp", nullable: true })
  reminder_sent_at: Date;

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({ name: "completion_notes", type: "text", nullable: true })
  completion_notes: string;

  @Column({ name: "google_calendar_event_id", length: 255, nullable: true })
  google_calendar_event_id: string;

  @Column({ name: "completed_at", type: "timestamp", nullable: true })
  completed_at: Date;

  @Column({ name: "cancelled_at", type: "timestamp", nullable: true })
  cancelled_at: Date;

  @Column({ name: "cancellation_reason", type: "text", nullable: true })
  cancellation_reason: string;

  @Column({ name: "is_deleted", type: "smallint", default: 0 })
  is_deleted: number;

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
