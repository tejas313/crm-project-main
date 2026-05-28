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

  @Column({ name: "is_cancel", type: "boolean", nullable: true })
  is_cancel: boolean;

  @Column({ name: "leave_type", length: 50, nullable: true })
  leave_type: string;

  @Column({ name: "reason", type: "text", nullable: true })
  reason: string;

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
