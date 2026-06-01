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

export enum CallOrigin {
  INBOUND = "inbound",
  OUTBOUND = "outbound",
  DIALER = "dialer",
}

@Entity("dialer_calls")
@Index(["fk_lead_id"])
@Index(["fk_agent_id"])
@Index(["dialer_status"])
@Index(["fk_crm_lead_status_id"])
export class DialerCalls {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", type: "integer", nullable: false })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "fk_agent_id", type: "integer", nullable: false })
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

  @Column({ name: "call_date_time", type: "timestamp", nullable: false })
  call_date_time: Date;

  @Column({ name: "call_duration", type: "integer", nullable: true })
  call_duration: number;

  @Column({ name: "call_origin", type: "enum", enum: CallOrigin, nullable: false })
  call_origin: CallOrigin;

  @Column({ name: "owner", nullable: true, type: "integer" })
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
    name: "fk_crm_lead_status_id",
    type: "integer",
    nullable: true,
  })
  fk_crm_lead_status_id: number;

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
