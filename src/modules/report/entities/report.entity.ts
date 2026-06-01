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

@Entity("reports")
@Index(["category"])
@Index(["is_active"])
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "report_name", length: 255, nullable: false })
  report_name: string;

  @Column({ name: "report_code", length: 100, unique: true, nullable: false })
  report_code: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: "category", length: 50, nullable: true })
  category: string;

  @Column({ name: "is_active", type: "smallint", default: 1 })
  is_active: number;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @Column({ name: "created_by", type: "integer", nullable: true })
  created_by: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "created_by" })
  createdByUser: User;

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
