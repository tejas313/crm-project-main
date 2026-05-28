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
import { Lead } from "./lead.entity";
import { User } from "../../user/entities/user.entity";

@Entity("referral_tracking")
@Index(["fk_referrer_lead_id"])
@Index(["fk_referred_lead_id"])
@Index(["referral_code"])
@Index(["is_converted"])
export class ReferralTracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_referrer_lead_id", type: "integer", nullable: false })
  fk_referrer_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_referrer_lead_id" })
  referrer_lead: Lead;

  @Column({ name: "fk_referred_lead_id", type: "integer", nullable: false })
  fk_referred_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_referred_lead_id" })
  referred_lead: Lead;

  @Column({ name: "referral_code", length: 50, nullable: true })
  referral_code: string;

  @Column({ name: "referral_source", length: 100, nullable: true })
  referral_source: string;

  @Column({ name: "referral_date", type: "timestamp", nullable: false })
  referral_date: Date;

  @Column({ name: "is_converted", type: "boolean", default: false })
  is_converted: boolean;

  @Column({ name: "conversion_date", type: "timestamp", nullable: true })
  conversion_date: Date;

  @Column({ name: "reward_given", type: "boolean", default: false })
  reward_given: boolean;

  @Column({ name: "notes", type: "text", nullable: true })
  notes: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @Column({ name: "created_by", type: "integer", nullable: true })
  created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  createdByUser: User;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @Column({ name: "modify_at", type: "timestamp", nullable: true })
  modify_at: Date;

  @Column({ name: "modify_by", type: "integer", nullable: true })
  modify_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "modify_by" })
  modifyByUser: User;
}
