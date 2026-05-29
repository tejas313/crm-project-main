import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Automation } from "./automation.entity";
import { Lead } from "../../lead/entities/lead.entity";

@Entity("automation_logs")
@Index(["fk_automation_id"])
@Index(["fk_lead_id"])
@Index(["trigger_event"])
@Index(["status"])
@Index(["executed_at"])
export class AutomationExecutionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_automation_id", type: "integer", nullable: false })
  fk_automation_id: number;

  @ManyToOne(() => Automation, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_automation_id" })
  automation: Automation;

  @Column({ name: "fk_lead_id", nullable: true, type: "integer" })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({
    name: "trigger_event",
    length: 100,
    nullable: false,
    type: "varchar",
  })
  trigger_event: string;

  @Column({
    name: "action_taken",
    length: 255,
    nullable: false,
    type: "varchar",
  })
  action_taken: string;

  @Column({ name: "status", length: 50, nullable: false, type: "varchar" })
  status: string;

  @Column({ name: "error_message", type: "text", nullable: true })
  error_message: string;

  @Column({ name: "execution_time_ms", type: "integer", nullable: true })
  execution_time_ms: number;

  @CreateDateColumn({ name: "executed_at" })
  executed_at: Date;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
