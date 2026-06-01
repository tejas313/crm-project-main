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
import { Appointment } from "../../appointment/entities/appointment.entity";
import { Notes } from "../../lead/entities/notes.entity";
import { Automation } from "../../automation/entities/automation.entity";
import { Task } from "../../task/entities/task.entity";
import { DialerCalls } from "../../dialer/entities/dialer-calls.entity";

export enum ActivityType {
  LEAD_CREATED = "lead_created",
  LEAD_ASSIGNED = "lead_assigned",
  LEAD_UPDATED = "lead_updated",
  STATUS_CHANGED = "status_changed",
  OWNER_CHANGED = "owner_changed",
  DIALER_ACTIVITY = "dialer_activity",
  CALL_MADE = "call_made",
  APPOINTMENT_CREATED = "appointment_created",
  APPOINTMENT_UPDATED = "appointment_updated",
  PRESENTATION_UPDATED = "presentation_updated",
  NOTE_ADDED = "note_added",
  TASK_CREATED = "task_created",
  TASK_UPDATED = "task_updated",
  STEMCELL_SYNC = "stemcell_sync",
  BULK_OPERATION = "bulk_operation",
  REFERRAL_CREATED = "referral_created",
}

@Entity("lead_activities")
@Index(["fk_lead_id"])
@Index(["activity_type"])
@Index(["created_at"])
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

  @ManyToOne(() => Appointment, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_appointment_id" })
  appointment: Appointment;

  @Column({ name: "fk_notes_id", type: "integer", nullable: true })
  fk_notes_id: number;

  @ManyToOne(() => Notes, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_notes_id" })
  note: Notes;

  @Column({ name: "fk_automation_id", type: "integer", nullable: true })
  fk_automation_id: number;

  @ManyToOne(() => Automation, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_automation_id" })
  automation: Automation;

  @Column({ name: "fk_task_id", type: "integer", nullable: true })
  fk_task_id: number;

  @ManyToOne(() => Task, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_task_id" })
  task: Task;

  @Column({ name: "fk_dialer_id", type: "integer", nullable: true })
  fk_dialer_id: number;

  @ManyToOne(() => DialerCalls, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_dialer_id" })
  dialer: DialerCalls;

  @Column({ name: "description", type: "text", nullable: true })
  description: string;

  @Column({ name: "metadata", type: "json", nullable: true })
  metadata: any;

  @CreateDateColumn({
    name: "created_at",
  })
  created_at: Date;

  @Column({ name: "created_by", type: "integer", nullable: true })
  created_by: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "created_by" })
  createdByUser: User;
}
