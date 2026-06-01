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
  PRESENTATION_DONE = "presentation_done",
  PRESENTATION_NOT_DONE = "presentation_not_done",
}

export enum SalesStatus {
  FOLLOW_UP_CALL = "follow_up_call",
  READY_TO_ENROLL = "ready_to_enroll",
  DROPPED = "dropped",
}

export enum SalesType {
  RE = "re",
  TELESALES = "telesales",
}

export enum FollowUpDisposition {
  FOLLOW_UP_COLD = "follow_up_cold",
  FOLLOW_UP_WARM = "follow_up_warm",
  UNABLE_TO_CONTACT = "unable_to_contact",
  WILL_ENROLL_AFTER_1_WEEK = "will_enroll_after_1_week",
  WILL_ENROLL_AFTER_2_WEEK = "will_enroll_after_2_week",
  WILL_ENROLL_AFTER_3_WEEK = "will_enroll_after_3_week",
  RE_NOT_CONNECTED = "re_not_connected",
  PERSONAL_PPT_REQUIRED = "personal_ppt_required",
  ONLY_WHATSAPP_COMMUNICATION = "only_whatsapp_communication",
  RE_DUPLICATED = "re_duplicated",
  IN_TOUCH_WITH_RE = "in_touch_with_re",
  CONNECTED_ON_WHATSAPP = "connected_on_whatsapp",
  IN_DISCUSSION_NOT_DECIDED = "in_discussion_not_decided",
  WE_WILL_CALL_UPFRONT = "we_will_call_upfront",
}

export enum DroppedReason {
  ALREADY_DELIVERED = "already_delivered",
  COST_TOO_HIGH = "cost_too_high",
  DEMAND_HIGHER_DISCOUNT = "demand_higher_discount",
  DOCTOR_NOT_RECOMMENDED = "doctor_not_recommended",
  ENROLLED_WITH_COMPETITOR = "enrolled_with_competitor",
  UNABLE_TO_ESTABLISH_CONTACT = "unable_to_establish_contact",
  CUSTOMER_CANCELLED_CONSULTATION = "customer_cancelled_consultation",
  CONCEPT = "concept",
  ALREADY_ENROLLED_LIFECELL = "already_enrolled_lifecell",
  NEVER_ASKED_APPOINTMENT = "never_asked_appointment",
  REGISTERED_FREE_GIFTS = "registered_free_gifts",
  WANTS_FREE_STEMCELL_COVER = "wants_free_stemcell_cover",
  NON_SERVICEABLE_AREA = "non_serviceable_area",
  ALREADY_PRESERVED_FIRST_BABY = "already_preserved_first_baby",
  NOT_DECISION_MAKER = "not_decision_maker",
  HIGH_COLLECTION_CHARGES = "high_collection_charges",
  NOT_COMFORTABLE_SELF_COLLECTION = "not_comfortable_self_collection",
  NO_SYMPTOMS_NOT_REQUIRED = "no_symptoms_not_required",
  REFERRAL_LEAD_CREATED = "referral_lead_created",
  DUPLICATE_DONE = "duplicate_done",
}

@Entity("presentations")
@Index(["fk_lead_id"])
@Index(["fk_appointment_id"])
@Index(["presentation_status"])
@Index(["sales_status"])
@Index(["presentation_date"])
@Index(["follow_up_date_time"])
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

  @Column({ name: "fk_assign_sales_id", nullable: false, type: "integer" })
  fk_assign_sales_id: number;

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

  @Column({ name: "product_type", length: 100, nullable: true, type: "varchar" })
  product_type: string;

  @Column({ name: "promo_code", type: "varchar" })
  promo_code: string;

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

  @Column({ name: "fk_doctor_id", nullable: true, type: "integer" })
  fk_doctor_id: number;

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

  @Column({ name: "notes", type: "text", nullable: true })
  notes: string;

  @Column({ name: "is_deleted", type: "smallint", default: 0 })
  is_deleted: number;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @Column({ name: "created_by", nullable: true, type: "integer" })
  created_by: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "created_by" })
  created_by_user: User;

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
