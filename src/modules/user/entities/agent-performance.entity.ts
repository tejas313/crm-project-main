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

@Entity("agent_performance")
@Index(["fk_agent_id"])
@Index(["performance_date"])
@Index(["fk_agent_id", "performance_date"], { unique: true })
export class AgentPerformance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_agent_id", type: "integer", nullable: false })
  fk_agent_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_agent_id" })
  agent: User;

  @Column({ name: "performance_date", type: "date", nullable: false })
  performance_date: Date;

  @Column({ name: "total_leads_assigned", type: "integer", default: 0 })
  total_leads_assigned: number;

  @Column({ name: "total_calls_made", type: "integer", default: 0 })
  total_calls_made: number;

  @Column({ name: "connected_calls", type: "integer", default: 0 })
  connected_calls: number;

  @Column({ name: "appointments_set", type: "integer", default: 0 })
  appointments_set: number;

  @Column({ name: "presentations_done", type: "integer", default: 0 })
  presentations_done: number;

  @Column({ name: "enrollments", type: "integer", default: 0 })
  enrollments: number;

  @Column({ name: "conversion_rate", type: "decimal", precision: 5, scale: 2, nullable: true })
  conversion_rate: number;

  @Column({ name: "avg_call_duration", type: "integer", nullable: true })
  avg_call_duration: number;

  @Column({ name: "total_talk_time", type: "integer", default: 0 })
  total_talk_time: number;

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
