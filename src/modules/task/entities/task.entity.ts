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
@Index(["task_type"])
@Index(["is_deleted"])
@Index(["priority"])
@Index(["fk_parent_task_id"])
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "task_id", length: 50, unique: true })
  task_id: string;

  @Column({ name: "fk_lead_id" })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "fk_owner_id" })
  fk_owner_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_owner_id" })
  owner: User;

  @Column({ name: "task_type", type: "enum", enum: TaskType })
  task_type: TaskType;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ length: 20, default: "medium" })
  priority: string;

  @Column({ name: "scheduled_at", type: "timestamp" })
  scheduled_at: Date;

  @Column({ name: "due_date", type: "timestamp", nullable: true })
  due_date: Date;

  @Column({ name: "reminder_at", type: "timestamp", nullable: true })
  reminder_at: Date;

  @Column({ name: "reminder_sent_at", type: "timestamp", nullable: true })
  reminder_sent_at: Date;

  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ name: "completion_notes", type: "text", nullable: true })
  completion_notes: string;

  @Column({ name: "google_calendar_event_id", length: 255, nullable: true })
  google_calendar_event_id: string;

  @Column({ name: "is_recurring", default: false })
  is_recurring: boolean;

  @Column({
    name: "recurrence_pattern",
    length: 100,
    nullable: true,
    type: "varchar",
  })
  recurrence_pattern: string;

  @Column({ name: "fk_parent_task_id", nullable: true, type: "integer" })
  fk_parent_task_id: number;

  @ManyToOne(() => Task, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_parent_task_id" })
  parent_task: Task;

  @Column({ name: "completed_at", type: "timestamp", nullable: true })
  completed_at: Date;

  @Column({ name: "fk_completed_by", nullable: true, type: "integer" })
  fk_completed_by: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_completed_by" })
  completed_by_user: User;

  @Column({ name: "cancelled_at", type: "timestamp", nullable: true })
  cancelled_at: Date;

  @Column({ name: "fk_cancelled_by", nullable: true, type: "integer" })
  fk_cancelled_by: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_cancelled_by" })
  cancelled_by_user: User;

  @Column({ name: "cancellation_reason", type: "text", nullable: true })
  cancellation_reason: string;

  @Column({ name: "fk_created_by_user_id", type: "integer" })
  fk_created_by_user_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_created_by_user_id" })
  created_by_user: User;

  @Column({ name: "is_deleted", type: "smallint", width: 6, default: 0 })
  is_deleted: number;
  // Reference: project_dbml

  @Column({ name: "deleted_at", type: "timestamp", nullable: true })
  deleted_at: Date;

  @Column({ name: "fk_deleted_by", nullable: true, type: "integer" })
  fk_deleted_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "fk_deleted_by" })
  deleted_by: User;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

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
