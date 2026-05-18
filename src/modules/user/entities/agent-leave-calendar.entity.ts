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
import { User } from "../../user/entities/user.entity";

@Entity("agent_leave_calendar")
@Index(["fk_agent_id"])
@Index(["leave_start_date"])
@Index(["leave_end_date"])
export class AgentLeaveCalendar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_agent_id", type: "integer" })
  fk_agent_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_agent_id" })
  agent: User;

  @Column({ name: "leave_start_date", type: "date" })
  leave_start_date: Date;

  @Column({ name: "leave_end_date", type: "date" })
  leave_end_date: Date;

  @Column({ name: "leave_count", type: "int" })
  leave_count: number;

  @Column({ name: "is_cancel", default: false })
  is_cancel: boolean;

  @Column({ name: "leave_type", length: 50, nullable: true, type: "varchar" })
  leave_type: string;

  @Column({ type: "text", nullable: true })
  reason: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
