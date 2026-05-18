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

export enum AppointmentType {
  SALES = "Sales",
  TELESALES = "Telesales",
}

export enum SalesType {
  RE = "Re",
  TELESALES = "Telesales",
}

export enum ConsultationType {
  PERSONAL = "Personal",
  TELEPHONE = "Telephone",
  VIDEO = "Video",
}

@Entity("appointments")
@Index(["fk_lead_id"])
@Index(["fk_owner_id"])
@Index(["current_appointment_date"])
@Index(["fk_hospital_id"])
@Index(["fk_doctor_id"])
@Index(["is_fallback_assignment"])
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: "appointment_id",
    type: "varchar",
    length: 50,
    unique: true,
    nullable: true,
  })
  appointment_id: string;

  @Column({ name: "fk_lead_id", type: "integer" })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "appointment_type", type: "enum", enum: AppointmentType })
  appointment_type: AppointmentType;

  @Column({ name: "consultation_type", type: "enum", enum: ConsultationType })
  consultation_type: ConsultationType;

  // Assignment
  @Column({ name: "fk_owner_id", type: "integer" })
  fk_owner_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_owner_id" })
  owner: User;

  @Column({ name: "sales_type", type: "enum", enum: SalesType, nullable: true })
  sales_type: SalesType;

  @Column({ name: "fk_assign_sales_id", type: "integer", nullable: true })
  fk_assign_sales_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_assign_sales_id" })
  assigned_sales: User;

  @Column({ name: "is_fallback_assignment", default: false })
  is_fallback_assignment: boolean;

  // Medical Information
  @Column({ name: "pregnancy_edd", type: "date", nullable: true })
  pregnancy_edd: Date;

  // Hospital/Doctor Assignment
  @Column({ name: "fk_state_id", type: "integer", nullable: true })
  fk_state_id: number;

  @Column({ name: "fk_city_id", type: "integer", nullable: true })
  fk_city_id: number;

  @Column({ name: "fk_hospital_id", type: "integer", nullable: true })
  fk_hospital_id: number;

  @Column({ name: "fk_doctor_id", type: "integer", nullable: true })
  fk_doctor_id: number;

  @Column({ name: "address", type: "text", nullable: true })
  address: string;

  // Telesales specific
  @Column({ name: "preferred_language", length: 50, nullable: true })
  preferred_language: string;

  // Scheduling
  @Column({
    name: "original_appointment_date",
    type: "timestamp",
    nullable: true,
  })
  original_appointment_date: Date;

  @Column({
    name: "current_appointment_date",
    type: "timestamp",
    nullable: true,
  })
  current_appointment_date: Date;

  @Column({ name: "confirmed_slot", type: "timestamp", nullable: true })
  confirmed_slot: Date;

  // Status
  @Column({
    name: "disposition_status",
    length: 100,
    type: "varchar",
    nullable: true,
  })
  disposition_status: string;

  @Column({ name: "is_locked", type: "smallint", default: 0 })
  is_locked: number;

  @Column({ name: "is_synced_with_stemcell", type: "smallint", default: 0 })
  is_synced_with_stemcell: boolean;

  @Column({ type: "text", nullable: true })
  notes: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
