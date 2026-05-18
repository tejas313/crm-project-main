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

@Entity("automation_execution_logs")
@Index(["fk_automation_id"])
@Index(["fk_lead_id"])
@Index(["execution_status"])
@Index(["executed_at"])
export class AutomationExecutionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_automation_id", type: "integer" })
  fk_automation_id: number;

  @ManyToOne(() => Automation, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_automation_id" })
  automation: Automation;

  @Column({ name: "fk_lead_id", nullable: true, type: "integer" })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "execution_status", length: 50, type: "varchar" })
  execution_status: string;

  @Column({ name: "execution_data", type: "json", nullable: true })
  execution_data: any;

  @Column({ name: "error_message", type: "text", nullable: true })
  error_message: string;

  @CreateDateColumn({ name: "executed_at" })
  executed_at: Date;
}
