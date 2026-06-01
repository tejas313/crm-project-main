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
import { User } from "./user.entity";

export enum LeaveType {
  PAID_LEAVE = "Paid Leave",
  SICK = "Sick",
  CASUAL = "Casual",
  UNPAID = "Unpaid",
}

@Entity("agent_leave_calendar")
@Index(["fk_agent_id"])
@Index(["leave_start_date"])
@Index(["leave_end_date"])
export class AgentLeaveCalendar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_agent_id", type: "integer", nullable: false })
  fk_agent_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_agent_id" })
  agent: User;

  @Column({ name: "leave_start_date", type: "date", nullable: false })
  leave_start_date: Date;

  @Column({ name: "leave_end_date", type: "date", nullable: false })
  leave_end_date: Date;

  @Column({ name: "leave_count", type: "integer", nullable: false })
  leave_count: number;

  @Column({ name: "is_cancel", type: "smallint", default: 0 })
  is_cancel: number;

  @Column({
    name: "leave_type",
    type: "enum",
    enum: LeaveType,
    nullable: true,
  })
  leave_type: LeaveType;

  @Column({ name: "reason", type: "text", nullable: true })
  reason: string;

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
