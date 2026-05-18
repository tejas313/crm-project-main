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
import { Appointment } from "../../appointment/entities/appointment.entity";

@Entity("stemcell_logs")
@Index(["fk_lead_id"])
@Index(["fk_appointment_id"])
@Index(["stemcell_appointment_id"])
@Index(["sync_date"])
export class StemcellLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", type: "integer" })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "fk_appointment_id", nullable: true, type: "integer" })
  fk_appointment_id: number;

  @ManyToOne(() => Appointment, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_appointment_id" })
  appointment: Appointment;

  @Column({
    name: "stemcell_appointment_id",
    nullable: true,
    type: "integer",
  })
  stemcell_appointment_id: string;

  @Column({
    name: "lead_gynaecologist",
    length: 255,
    nullable: true,
    type: "varchar",
  })
  lead_gynaecologist: string;

  @Column({
    name: "lead_hospital",
    length: 255,
    nullable: true,
    type: "varchar",
  })
  lead_hospital: string;

  @Column({ name: "pregnancy_edd", type: "date", nullable: true })
  pregnancy_edd: Date;

  @Column({
    name: "appointment_created_date",
    type: "timestamp",
    nullable: true,
  })
  appointment_created_date: Date;

  @Column({
    name: "original_appointment_due_date",
    type: "timestamp",
    nullable: true,
  })
  original_appointment_due_date: Date;

  @Column({
    name: "current_appointment_due_date",
    type: "timestamp",
    nullable: true,
  })
  current_appointment_due_date: Date;

  @Column({ name: "lead_status", length: 100, nullable: true, type: "varchar" })
  lead_status: string;

  @Column({ name: "telesales_or_sales", length: 50, nullable: true })
  telesales_or_sales: string;

  @Column({
    name: "presentation_status_from_re",
    length: 100,
    nullable: true,
    type: "varchar",
  })
  presentation_status_from_re: string;

  @Column({
    name: "sales_status",
    length: 100,
    nullable: true,
    type: "varchar",
  })
  sales_status: string;

  @Column({
    name: "overall_status",
    length: 100,
    nullable: true,
    type: "varchar",
  })
  overall_status: string;

  @Column({ name: "re_name", length: 255, nullable: true, type: "varchar" })
  re_name: string;

  @Column({ name: "re_code", length: 50, nullable: true, type: "varchar" })
  re_code: string;

  @Column({ name: "centre", length: 100, nullable: true, type: "varchar" })
  centre: string;

  @Column({ name: "branch_code", length: 50, nullable: true, type: "varchar" })
  branch_code: string;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ name: "sync_date", type: "timestamp" })
  sync_date: Date;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
