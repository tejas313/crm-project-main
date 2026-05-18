import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  UpdateDateColumn,
} from "typeorm";
import { Presentation } from "./presentation.entity";
import { Lead } from "../../lead/entities/lead.entity";
import { Appointment } from "../../appointment/entities/appointment.entity";
import { User } from "../../user/entities/user.entity";
import { SalesStatus } from "./presentation.entity";

@Entity("presentation_status_logs")
@Index(["fk_presentation_id"])
@Index(["fk_lead_id"])
@Index(["fk_appointment_id"])
@Index(["created_at"])
export class PresentationStatusLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_presentation_id", type: "integer" })
  fk_presentation_id: number;

  @ManyToOne(() => Presentation, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_presentation_id" })
  presentation: Presentation;

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

  @Column({ name: "sales_status", type: "enum", enum: SalesStatus })
  sales_status: SalesStatus;

  @Column({ name: "follow_up_date_time", type: "timestamp", nullable: true })
  follow_up_date_time: Date;

  @Column({ name: "presentation_date", type: "date", nullable: true })
  presentation_date: Date;

  @Column({ name: "fk_state_id", nullable: true, type: "integer" })
  fk_state_id: number;

  @Column({ name: "fk_city_id", nullable: true, type: "integer" })
  fk_city_id: number;

  @Column({ name: "fk_hospital_id", nullable: true, type: "integer" })
  fk_hospital_id: number;

  @Column({ name: "fk_doctor_id", nullable: true, type: "integer" })
  fk_doctor_id: number;

  @Column({ name: "fk_owner_id", type: "integer" })
  fk_owner_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_owner_id" })
  owner: User;

  @Column({ name: "pregnancy_edd", type: "date", nullable: true })
  pregnancy_edd: Date;

  @Column({ name: "push_enrollment_to_sales", default: 0, type: "smallint" })
  push_enrollment_to_sales: number;

  @Column({ name: "push_followup_to_sales", default: 0, type: "smallint" })
  push_followup_to_sales: number;

  @Column({ name: "confirm_enrollment_followup", default: 0, type: "smallint" })
  confirm_enrollment_followup: number;

  @Column({
    name: "sales_push_type",
    length: 50,
    nullable: true,
    type: "varchar",
  })
  sales_push_type: string;

  @Column({ type: "text", nullable: true })
  notes: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "created_at" })
  updated_at: Date;
}
