import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Lead } from "../../lead/entities/lead.entity";
import { User } from "../../user/entities/user.entity";

@Entity("lead_audit_trail")
@Index(["fk_lead_id"])
@Index(["changed_at"])
@Index(["fk_changed_by_user_id"])
export class LeadAuditTrail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", type: "integer" })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "field_name", length: 100, type: "varchar" })
  field_name: string;

  @Column({ name: "old_value", type: "text", nullable: true })
  old_value: string;

  @Column({ name: "new_value", type: "text", nullable: true })
  new_value: string;

  @Column({ name: "fk_changed_by_user_id", type: "integer" })
  fk_changed_by_user_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_changed_by_user_id" })
  changed_by_user: User;

  @Column({
    name: "changed_at",
    type: "timestamp",
  })
  changed_at: Date;

  @CreateDateColumn({
    name: "created_at",
  })
  created_at: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updated_at: Date;
}
