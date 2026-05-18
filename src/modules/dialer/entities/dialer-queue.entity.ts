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

export enum DialerQueueStatus {
  QUEUED = "Queued",
  CALLING = "Calling",
  COMPLETED = "Completed",
  FAILED = "Failed",
  SKIPPED = "Skipped",
}

@Entity("dialer_queue")
@Index(["fk_lead_id"])
@Index(["fk_agent_id"])
@Index(["queue_status"])
export class DialerQueue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", type: "integer" })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "fk_agent_id", nullable: true, type: "integer" })
  fk_agent_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_agent_id" })
  agent: User;

  @Column({ type: "integer", default: 0 })
  priority: number;

  @Column({ name: "scheduled_call_time", type: "timestamp" })
  scheduled_call_time: Date;

  @Column({ name: "is_immediate_dial", default: 0, type: "smallint" })
  is_immediate_dial: number;

  @Column({
    name: "queue_status",
    type: "enum",
    enum: DialerQueueStatus,
    default: DialerQueueStatus.QUEUED,
  })
  queue_status: DialerQueueStatus;

  @Column({ name: "attempt_number", type: "integer", default: 1 })
  attempt_number: number;

  @Column({ name: "last_attempt_at", type: "timestamp", nullable: true })
  last_attempt_at: Date;

  @Column({ name: "next_retry_at", type: "timestamp", nullable: true })
  next_retry_at: Date;

  @Column({ name: "error_message", type: "text", nullable: true })
  error_message: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
