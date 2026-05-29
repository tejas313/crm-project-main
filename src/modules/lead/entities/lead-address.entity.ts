import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
  ManyToOne,
} from "typeorm";
import { Lead } from "./lead.entity";
import { User } from "../../user/entities/user.entity";

@Entity("leads_address")
@Index(["fk_state_id"])
@Index(["fk_city_id"])
export class LeadAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", type: "integer", nullable: false })
  fk_lead_id: number;

  @OneToOne(() => Lead, (lead) => lead.leadAddress, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "fk_state_id", type: "integer", nullable: true })
  fk_state_id: number;

  @Column({ name: "fk_city_id", type: "integer", nullable: true })
  fk_city_id: number;

  @Column({ name: "pincode", length: 10, type: "varchar", nullable: true })
  pincode: string;

  @Column({ name: "address", type: "text", nullable: true })
  address: string;

  @Column({ name: "fk_hospital_id", type: "integer", nullable: true })
  fk_hospital_id: number;

  @Column({ name: "fk_doctor_id", type: "integer", nullable: true })
  fk_doctor_id: number;

  @Column({ name: "is_deleted", type: "smallint", default: 0 })
  is_deleted: number;

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
