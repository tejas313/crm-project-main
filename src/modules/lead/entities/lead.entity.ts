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
import { User } from "../../user/entities/user.entity";

export enum LeadStatus {
  NEW_LEAD = "New lead",
  CONTACTED = "Contacted",
  QUALIFIED = "Qualified",
  APPOINTMENT_SET = "Appointment set",
  PRESENTATION_DONE = "Presentation done",
  FOLLOW_UP = "Follow up",
  READY_TO_ENROLL = "Ready to enroll",
  ENROLLED = "Enrolled",
  DROPPED = "Dropped",
  NOT_REACHABLE = "Not reachable",
}

export enum LeadSource {
  FACEBOOK = "Facebook",
  WEBSITE = "Website",
  INSTAGRAM = "Instagram",
  PHONE_CALL = "Phone call",
  WEBSITE_FORM = "Website form",
  REFERRAL = "Referral",
  OTHER = "Other",
}

export enum LeadStage {
  NEW = "New",
  CONTACTED = "Contacted",
  QUALIFIED = "Qualified",
  APPOINTMENT_SCHEDULED = "Appointment scheduled",
  PRESENTATION_COMPLETED = "Presentation completed",
  FOLLOW_UP = "Follow up",
  READY_TO_ENROLL = "Ready to enroll",
  ENROLLED = "Enrolled",
  DROPPED = "Dropped",
  NOT_REACHABLE = "Not reachable",
}

@Entity("leads")
@Index(["lead_source"])
@Index(["lead_status"])
@Index(["created_at"])
@Index(["state_id"])
@Index(["city_id"])
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "lead_id", type: "integer", unique: true })
  lead_id: string;

  @Column({ name: "first_name", type: "varchar", length: 100 })
  first_name: string;

  @Column({ name: "last_name", type: "varchar", length: 100, nullable: true })
  last_name: string;

  @Column({ length: 20, unique: true, type: "varchar" })
  phone: string;

  @Column({
    name: "phone_country_code",
    length: 5,
    default: "+91",
    type: "varchar",
  })
  phone_country_code: string;

  @Column({
    name: "alternate_phone",
    length: 20,
    type: "varchar",
    nullable: true,
  })
  alternate_phone: string;

  @Column({
    name: "alternate_email",
    length: 20,
    type: "varchar",
    nullable: true,
  })
  alternate_email: string;

  @Column({ length: 255, nullable: true, unique: true, type: "varchar" })
  email: string;

  // Source Information
  @Column({ name: "lead_source", type: "enum", enum: LeadSource })
  lead_source: LeadSource;

  @Column({ length: 100, nullable: true, type: "varchar" })
  medium: string;

  @Column({ name: "source_id", length: 100, nullable: true, type: "varchar" })
  source_id: string;

  @Column({ name: "medium_id", length: 100, nullable: true, type: "varchar" })
  medium_id: string;

  @Column({
    name: "campaign_name",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  campaign_name: string;

  @Column({ name: "campaign_type", length: 100, nullable: true })
  campaign_type: string;

  @Column({
    name: "referrer_url",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  referrer_url: string;

  @Column({
    name: "landing_page_url",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  landing_page_url: string;

  // Medical/Sales Information
  @Column({ name: "pregnancy_edd", type: "date", nullable: true })
  pregnancy_edd: Date;

  @Column({ name: "pregnancy_week", type: "integer", nullable: true })
  pregnancy_week: number;

  @Column({
    name: "interested_product",
    length: 255,
    type: "varchar",
    nullable: true,
  })
  interested_product: string;

  @Column({
    name: "current_hospital",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  current_hospital: string;

  @Column({
    name: "current_doctor",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  current_doctor: string;

  // Location Information
  @Column({ name: "state_id", type: "integer", nullable: true })
  state_id: number;

  @Column({ name: "city_id", type: "integer", nullable: true })
  city_id: number;

  @Column({ length: 10, type: "varchar", nullable: true })
  pincode: string;

  @Column({ type: "text", nullable: true })
  address: string;

  // System Information
  @Column({
    name: "lead_status",
    type: "enum",
    enum: LeadStatus,
    default: LeadStatus.NEW_LEAD,
  })
  lead_status: LeadStatus;

  @Column({
    name: "lead_stage",
    type: "enum",
    enum: LeadStage,
    default: LeadStage.NEW,
  })
  lead_stage: LeadStage;

  @Column({ name: "fk_owner_id", nullable: true, type: "integer" })
  fk_owner_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_owner_id" })
  owner: User;

  @Column({ name: "assigned_at", type: "timestamp", nullable: true })
  assigned_at: Date;

  @Column({ name: "fk_assigned_by", nullable: true, type: "integer" })
  fk_assigned_by: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_assigned_by" })
  assigned_by: User;

  // Tracking & Validation
  @Column({ name: "call_attempt_count", type: "integer", default: 0 })
  call_attempt_count: number;

  @Column({ name: "last_contacted_at", type: "timestamp", nullable: true })
  last_contacted_at: Date;

  @Column({ name: "first_contacted_at", type: "timestamp", nullable: true })
  first_contacted_at: Date;

  @Column({ name: "appointment_set_at", type: "timestamp", nullable: true })
  appointment_set_at: Date;

  @Column({ name: "is_duplicate", default: 0, type: "smallint" })
  is_duplicate: number;

  @Column({ name: "fk_duplicate_of_lead_id", nullable: true, type: "integer" })
  fk_duplicate_of_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_duplicate_of_lead_id" })
  duplicate_of_lead: Lead;

  @Column({ name: "duplicate_checked_at", type: "timestamp", nullable: true })
  duplicate_checked_at: Date;

  @Column({ name: "is_valid_lead", default: 1, type: "integer" })
  is_valid_lead: number;

  @Column({ name: "is_engaged", default: 0, type: "smallint" })
  is_engaged: number;

  @Column({ name: "engagement_date", type: "timestamp", nullable: true })
  engagement_date: Date;

  @Column({ name: "is_resubmission", default: 0, type: "smallint" })
  is_resubmission: number;

  @Column({
    name: "original_submission_date",
    type: "timestamp",
    nullable: true,
  })
  original_submission_date: Date;

  @Column({ name: "resubmission_count", type: "integer", default: 0 })
  resubmission_count: number;

  @Column({ name: "is_nr7_triggered", default: 0, type: "smallint" })
  is_nr7_triggered: number;

  @Column({ name: "nr7_triggered_at", type: "timestamp", nullable: true })
  nr7_triggered_at: Date;

  // Quality & Scoring
  @Column({ name: "lead_score", type: "integer", default: 0 })
  lead_score: number;

  // Soft Delete
  @Column({ name: "is_deleted", type: "smallint", width: 6, default: 0 })
  is_deleted: number;
  // Reference: project_dbml

  @Column({ name: "deleted_at", type: "timestamp", nullable: true })
  deleted_at: Date;

  @Column({ name: "fk_deleted_by", nullable: true })
  fk_deleted_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "fk_deleted_by" })
  deleted_by: User;

  @Column({ name: "deletion_reason", type: "text", nullable: true })
  deletion_reason: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @Column({ name: "fk_created_by", nullable: true })
  fk_created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "fk_created_by" })
  created_by: User;

  @Column({ name: "fk_updated_by", nullable: true })
  fk_updated_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "fk_updated_by" })
  updated_by: User;

  // Computed property
  get fullName(): string {
    return this.last_name
      ? `${this.first_name} ${this.last_name}`
      : this.first_name;
  }
}
