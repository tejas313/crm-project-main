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
import { LeadStatus } from "../../lead/entities/lead.entity";

export enum CallOrigin {
  INBOUND = "Inbound",
  OUTBOUND = "Outbound",
  DIALER = "Dialer",
}

@Entity("dialer_calls")
@Index(["fk_lead_id"])
@Index(["fk_agent_id"])
@Index(["dialer_status"])
@Index(["crm_lead_status"])
export class DialerCalls {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", type: "integer" })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "fk_agent_id", type: "integer" })
  fk_agent_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_agent_id" })
  agent: User;

  @Column({
    name: "display_number",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  display_number: string;

  @Column({ name: "call_date_time", type: "timestamp" })
  call_date_time: Date;

  @Column({ name: "call_duration", type: "integer", nullable: true })
  call_duration: number;

  @Column({ name: "call_origin", type: "enum", enum: CallOrigin })
  call_origin: CallOrigin;

  @Column({ nullable: true })
  owner: number;

  @Column({
    name: "dialer_status",
    length: 100,
    type: "varchar",
    nullable: true,
  })
  dialer_status: string;

  @Column({
    name: "raw_call_status",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  raw_call_status: string;

  @Column({
    name: "crm_lead_status",
    type: "enum",
    enum: LeadStatus,
    nullable: true,
  })
  crm_lead_status: LeadStatus;

  @Column({
    name: "disposition_status",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  disposition_status: string;

  @Column({ name: "call_notes", type: "text", nullable: true })
  call_notes: string;

  @Column({
    name: "call_recording_url",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  call_recording_url: string;

  @Column({ name: "attempt_number", type: "integer", default: 1 })
  attempt_number: number;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
