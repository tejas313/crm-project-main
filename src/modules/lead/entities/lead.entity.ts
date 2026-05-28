import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User, UserRole } from "../../user/entities/user.entity";
import { LeadStatusEntity } from "./lead-status.entity";
import { LeadSourceMaster } from "./lead-source-master.entity";
import { LeadMediumMaster } from "./lead-medium-master.entity";
import { LeadAddress } from "./lead-address.entity";

export enum LeadStage {
  NEW = "new",
  CONTACTED = "contacted",
  QUALIFIED = "qualified",
  APPOINTMENT_SCHEDULED = "appointment_scheduled",
  PRESENTATION_COMPLETED = "presentation_completed",
  FOLLOW_UP = "follow_up",
  READY_TO_ENROLL = "ready_to_enroll",
  ENROLLED = "enrolled",
  DROPPED = "dropped",
  NOT_REACHABLE = "not_reachable",
}

@Entity("leads")
@Index(["lead_id"])
@Index(["lead_source_id"])
@Index(["lead_status_id"])
@Index(["created_at"])
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "lead_id", type: "integer", unique: true, nullable: false })
  lead_id: number;

  @Column({ name: "first_name", type: "varchar", length: 100 })
  first_name: string;

  @Column({ name: "last_name", type: "varchar", length: 100, nullable: true })
  last_name: string;

  @Column({ length: 20, unique: true, type: "varchar" })
  phone: string;

  @Column({
    name: "phone_country_code",
    length: 5,
    type: "varchar",
    default: "+91",
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
    length: 200,
    type: "varchar",
    nullable: true,
  })
  alternate_email: string;

  @Column({ length: 255, nullable: true, unique: true, type: "varchar" })
  email: string;

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
    name: "referrer_crm_number",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  referrer_crm_number: string;

  // System Information - Foreign Key Relations to Master Tables
  @Column({ name: "lead_status_id", type: "integer", nullable: true })
  lead_status_id: number;

  @ManyToOne(() => LeadStatusEntity, { onDelete: "SET NULL" })
  @JoinColumn({ name: "lead_status_id" })
  leadStatus: LeadStatusEntity;

  @Column({ name: "lead_source_id", type: "integer", nullable: true })
  lead_source_id: number;

  @ManyToOne(() => LeadSourceMaster, { onDelete: "SET NULL" })
  @JoinColumn({ name: "lead_source_id" })
  leadSourceMaster: LeadSourceMaster;

  @Column({ name: "lead_medium_id", type: "integer", nullable: true })
  lead_medium_id: number;

  @ManyToOne(() => LeadMediumMaster, { onDelete: "SET NULL" })
  @JoinColumn({ name: "lead_medium_id" })
  leadMediumMaster: LeadMediumMaster;

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

  @Column({ name: "is_duplicate", default: 0, type: "smallint" })
  is_duplicate: number;

  @Column({ name: "fk_duplicate_of_lead_id", nullable: true, type: "integer" })
  fk_duplicate_of_lead_id: number;

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

  @Column({ name: "note", type: "text", nullable: true })
  note: string;

  @Column({ name: "is_manually", type: "integer", default: 0 })
  is_manually: number;

  // Quality & Scoring
  @Column({ name: "lead_score", type: "integer", default: 0 })
  lead_score: number;

  // Soft Delete
  @Column({ name: "is_deleted", type: "smallint", width: 6, default: 0 })
  is_deleted: number;

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

  @Column({ name: "modify_at", type: "timestamp", nullable: true })
  modify_at: Date;

  @Column({ name: "modify_by", type: "integer", nullable: true })
  modify_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "modify_by" })
  modifyBy: User;

  @Column({ name: "created_by", type: "integer", nullable: true })
  created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @OneToOne(() => LeadAddress, (address) => address.lead)
  leadAddress: LeadAddress;

  // Computed property
  get fullName(): string {
    return this.last_name
      ? `${this.first_name} ${this.last_name}`
      : this.first_name;
  }
}
