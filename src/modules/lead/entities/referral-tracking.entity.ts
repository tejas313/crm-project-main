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

@Entity("referral_tracking")
@Index(["fk_referred_lead_id"])
@Index(["referral_code"])
@Index(["is_converted"])
export class ReferralTracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_referred_lead_id", type: "integer" })
  fk_referred_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_referred_lead_id" })
  referred_lead: Lead;

  @Column({
    name: "referral_code",
    length: 50,
    nullable: true,
    type: "varchar",
  })
  referral_code: string;

  @Column({
    name: "referral_source",
    length: 100,
    nullable: true,
    type: "varchar",
  })
  referral_source: string;

  @Column({ name: "referral_date", type: "timestamp" })
  referral_date: Date;

  @Column({ name: "is_converted", default: 0, type: "integer" })
  is_converted: number;

  @Column({ name: "conversion_date", type: "timestamp", nullable: true })
  conversion_date: Date;

  @Column({ name: "reward_given", default: 0, type: "integer" })
  reward_given: number;

  @Column({ type: "text", nullable: true })
  notes: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
