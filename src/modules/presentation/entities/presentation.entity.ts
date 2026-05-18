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
import { Appointment } from "../../appointment/entities/appointment.entity";

export enum PresentationStatus {
  PRESENTATION_DONE = "Presentation done",
  PRESENTATION_NOT_DONE = "Presentation not done",
}

export enum SalesStatus {
  FOLLOW_UP_CALL = "Follow up call",
  READY_TO_ENROLL = "Ready to enroll",
  DROPPED = "Dropped",
}

export enum SalesType {
  RE = "Re",
  TELESALES = "Telesales",
}

export enum FollowUpDisposition {
  FOLLOW_UP_COLD = "Follow up cold",
  FOLLOW_UP_WARM = "Follow up warm",
  UNABLE_TO_CONTACT = "Unable to contact",
  WILL_ENROLL_AFTER_1_WEEK = "Will enroll after 1 week",
  WILL_ENROLL_AFTER_2_WEEK = "Will enroll after 2 week",
  WILL_ENROLL_AFTER_3_WEEK = "Will enroll after 3 week",
  RE_NOT_CONNECTED = "Re not connected",
  PERSONAL_PPT_REQUIRED = "Personal ppt required",
  ONLY_WHATSAPP_COMMUNICATION = "Only whatsapp communication",
  RE_DUPLICATED = "Re duplicated",
  IN_TOUCH_WITH_RE = "In touch with re",
  CONNECTED_ON_WHATSAPP = "Connected on whatsapp",
  IN_DISCUSSION_NOT_DECIDED = "In discussion not decided",
  WE_WILL_CALL_UPFRONT = "We will call upfront",
}

export enum DroppedReason {
  ALREADY_DELIVERED = "Already delivered",
  COST_TOO_HIGH = "Cost too high",
  DEMAND_HIGHER_DISCOUNT = "Demand higher discount",
  DOCTOR_NOT_RECOMMENDED = "Doctor not recommended",
  ENROLLED_WITH_COMPETITOR = "Enrolled with competitor",
  UNABLE_TO_ESTABLISH_CONTACT = "Unable to establish contact",
  CUSTOMER_CANCELLED_CONSULTATION = "Customer cancelled consultation",
  CONCEPT = "Concept",
  ALREADY_ENROLLED_LIFECELL = "Already enrolled lifecell",
  NEVER_ASKED_APPOINTMENT = "Never asked appointment",
  REGISTERED_FREE_GIFTS = "Registered free gifts",
  WANTS_FREE_STEMCELL_COVER = "Wants free stemcell cover",
  NON_SERVICEABLE_AREA = "Non serviceable area",
  ALREADY_PRESERVED_FIRST_BABY = "Already preserved first baby",
  NOT_DECISION_MAKER = "Not decision maker",
  HIGH_COLLECTION_CHARGES = "High collection charges",
  NOT_COMFORTABLE_SELF_COLLECTION = "Not comfortable self collection",
  NO_SYMPTOMS_NOT_REQUIRED = "No symptoms not required",
  REFERRAL_LEAD_CREATED = "Referral lead created",
  DUPLICATE_DONE = "Duplicate done",
}

@Entity("presentations")
@Index(["fk_lead_id"])
@Index(["fk_appointment_id"])
@Index(["presentation_status"])
@Index(["sales_status"])
@Index(["presentation_date"])
@Index(["follow_up_date_time"])
@Index(["is_missed_followup"])
export class Presentation {
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

  @Column({ name: "sales_type", type: "enum", enum: SalesType, nullable: true })
  sales_type: SalesType;

  @Column({ name: "fk_assign_sales_id", nullable: true, type: "integer" })
  fk_assign_sales_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_assign_sales_id" })
  assigned_sales: User;

  @Column({
    name: "presentation_status",
    type: "enum",
    enum: PresentationStatus,
    nullable: true,
  })
  presentation_status: PresentationStatus;

  @Column({ name: "presentation_date", type: "date", nullable: true })
  presentation_date: Date;

  @Column({ name: "sales_status", type: "enum", enum: SalesStatus })
  sales_status: SalesStatus;

  @Column({ name: "plan_type", length: 100, nullable: true, type: "varchar" })
  plan_type: string;

  @Column({ name: "version", default: 1 })
  version: number;

  // Follow-up details
  @Column({ name: "follow_up_date_time", type: "timestamp", nullable: true })
  follow_up_date_time: Date;

  @Column({
    name: "follow_up_disposition",
    type: "enum",
    enum: FollowUpDisposition,
    nullable: true,
  })
  follow_up_disposition: FollowUpDisposition;

  @Column({ name: "is_missed_followup", default: 0, type: "smallint" })
  is_missed_followup: number;

  // Push to sales
  @Column({ name: "push_to_sales", default: 0, type: "smallint" })
  push_to_sales: number;

  @Column({ name: "push_follow_up_to_sales", default: 0, type: "smallint" })
  push_follow_up_to_sales: number;

  @Column({ name: "confirm_enrollment_followup", default: 0, type: "smallint" })
  confirm_enrollment_followup: number;

  @Column({
    name: "sales_push_type",
    length: 50,
    nullable: true,
    type: "varchar",
  })
  sales_push_type: string;

  // Hospital/Doctor for sales push
  @Column({ name: "fk_state_id", nullable: true, type: "integer" })
  fk_state_id: number;

  @Column({ name: "fk_city_id", nullable: true, type: "integer" })
  fk_city_id: number;

  @Column({ name: "fk_hospital_id", nullable: true, type: "integer" })
  fk_hospital_id: number;

  @Column({
    name: "hospital_name_text",
    length: 255,
    nullable: true,
    type: "varchar",
  })
  hospital_name_text: string;

  @Column({ name: "fk_doctor_id", nullable: true, type: "integer" })
  fk_doctor_id: number;

  @Column({
    name: "doctor_name_text",
    length: 255,
    nullable: true,
    type: "varchar",
  })
  doctor_name_text: string;

  @Column({ name: "centre", length: 100, nullable: true })
  centre: string;

  // Dropped reason
  @Column({
    name: "dropped_reason",
    type: "enum",
    enum: DroppedReason,
    nullable: true,
  })
  dropped_reason: DroppedReason;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ name: "fk_created_by_user_id" })
  fk_created_by_user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "fk_created_by_user_id" })
  created_by_user: User;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
