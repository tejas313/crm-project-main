import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Lead } from "../../lead/entities/lead.entity";

@Entity("integration_logs")
@Index(["integration_name"])
@Index(["success_flag"])
@Index(["created_at"])
@Index(["fk_lead_id"])
@Index(["status_code"])
export class IntegrationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "integration_name", length: 100, nullable: false })
  integration_name: string;

  @Column({ name: "request_url", type: "text", nullable: false })
  request_url: string;

  @Column({ name: "request_method", length: 10, nullable: false })
  request_method: string;

  @Column({ name: "request_payload", type: "json", nullable: true })
  request_payload: any;

  @Column({ name: "response_payload", type: "json", nullable: true })
  response_payload: any;

  @Column({ name: "status_code", type: "integer", nullable: true })
  status_code: number;

  @Column({ name: "success_flag", type: "smallint", default: 0 })
  success_flag: number;

  @Column({ name: "error_message", type: "text", nullable: true })
  error_message: string;

  @Column({ name: "response_time_ms", type: "integer", nullable: true })
  response_time_ms: number;

  @Column({ name: "fk_lead_id", nullable: true, type: "integer" })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
