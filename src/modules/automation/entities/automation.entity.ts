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

@Entity("automations")
@Index(["automation_type"])
@Index(["is_active"])
export class Automation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, type: "varchar", nullable: false })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: "automation_type", length: 100, nullable: false })
  automation_type: string;

  @Column({ name: "is_active", type: "smallint", default: 1 })
  is_active: number;

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
