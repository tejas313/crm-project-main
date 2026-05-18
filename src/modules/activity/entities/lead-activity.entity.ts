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
import { User } from "../../user/entities/user.entity";

export enum ActivityType {
  LEAD_CREATED = "Lead created",
  LEAD_ASSIGNED = "Lead assigned",
  LEAD_UPDATED = "Lead updated",
  STATUS_CHANGED = "Status changed",
  OWNER_CHANGED = "Owner changed",
  DIALER_ACTIVITY = "Dialer activity",
  CALL_MADE = "Call made",
  APPOINTMENT_CREATED = "Appointment created",
  APPOINTMENT_UPDATED = "Appointment updated",
  PRESENTATION_UPDATED = "Presentation updated",
  NOTE_ADDED = "Note added",
  TASK_CREATED = "Task created",
  TASK_UPDATED = "Task updated",
  STEMCELL_SYNC = "Stemcell sync",
  BULK_OPERATION = "Bulk operation",
  REFERRAL_CREATED = "Referral created",
}

@Entity("lead_activities")
@Index(["fk_lead_id"])
@Index(["activity_type"])
@Index(["created_at"])
@Index(["fk_performed_by_user_id"])
export class LeadActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", type: "integer", nullable: false })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({
    name: "activity_type",
    type: "enum",
    enum: ActivityType,
    nullable: false,
  })
  activity_type: ActivityType;

  @Column({ name: "fk_appointment_id", type: "integer", nullable: true })
  fk_appointment_id: number;

  @Column({ name: "fk_notes_id", type: "integer", nullable: true })
  fk_notes_id: number;

  @Column({ name: "fk_automation_id", type: "integer", nullable: true })
  fk_automation_id: number;

  @Column({ name: "fk_task_id", type: "integer", nullable: true })
  fk_task_id: number;

  @Column({ name: "fk_dialer_id", type: "integer", nullable: true })
  fk_dialer_id: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: "fk_performed_by_user_id", type: "integer", nullable: true })
  fk_performed_by_user_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_performed_by_user_id" })
  performed_by_user: User;

  @Column({ type: "json", nullable: true })
  metadata: any;

  @CreateDateColumn({
    name: "created_at",
  })
  created_at: Date;
}
// Reference: project_dbml
