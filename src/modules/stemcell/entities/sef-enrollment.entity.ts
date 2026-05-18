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
import { Appointment } from "../../appointment/entities/appointment.entity";

@Entity("sef_enrollments")
@Index(["fk_lead_id"])
@Index(["fk_appointment_id"])
@Index(["sef_date"])
@Index(["re_code"])
export class SEFEnrollment {
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
    name: "crm_number",
    length: 100,
    unique: true,
    nullable: true,
    type: "varchar",
  })
  crm_number: string;

  @Column({
    name: "customer_name",
    length: 255,
    nullable: true,
    type: "varchar",
  })
  customer_name: string;

  @Column({ name: "sef_date", type: "timestamp" })
  sef_date: Date;

  @Column({ name: "plan_detail", type: "text", nullable: true })
  plan_detail: string;

  @Column({ name: "re_name", length: 100, nullable: true, type: "varchar" })
  re_name: string;

  @Column({ name: "re_code", length: 50, nullable: true, type: "varchar" })
  re_code: string;

  @Column({ name: "branch_code", length: 50, nullable: true, type: "varchar" })
  branch_code: string;

  @Column({ name: "centre", length: 100, nullable: true, type: "varchar" })
  centre: string;

  @Column({ name: "pregnancy_edd", type: "date", nullable: true })
  pregnancy_edd: Date;

  @Column({ name: "presentation_date", type: "date", nullable: true })
  presentation_date: Date;

  @Column({ name: "lead_status", length: 100, nullable: true })
  lead_status: string;

  @Column({ name: "telesales_or_sales", length: 50, nullable: true })
  telesales_or_sales: string;

  @Column({ name: "presentation_status", length: 100, nullable: true })
  presentation_status: string;

  @Column({ name: "sales_status", length: 100, nullable: true })
  sales_status: string;

  @Column({ name: "overall_status", length: 100, nullable: true })
  overall_status: string;

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

  @Column({ name: "check_in_prior_1hr_clicked", default: false })
  check_in_prior_1hr_clicked: boolean;

  @Column({ type: "text", nullable: true })
  notes: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
