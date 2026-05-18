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

@Entity("stemcell_duplicate_check_logs")
@Index(["fk_lead_id"])
@Index(["phone"])
@Index(["email"])
@Index(["is_duplicate_in_stemcell"])
@Index(["check_date"])
export class StemcellDuplicateCheckLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", type: "integer" })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "phone", length: 20, type: "varchar" })
  phone: string;

  @Column({ name: "email", length: 255, nullable: true, type: "varchar" })
  email: string;

  @Column({ name: "is_duplicate_in_stemcell", default: false })
  is_duplicate_in_stemcell: boolean;

  @Column({
    name: "stemcell_customer_id",
    length: 100,
    nullable: true,
    type: "varchar",
  })
  stemcell_customer_id: string;

  @Column({ name: "check_date", type: "timestamp" })
  check_date: Date;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
