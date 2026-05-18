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
import { Manager } from "./manager.entity";

@Entity("agents")
@Index(["fk_manager_id"])
@Index(["is_deleted"])
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "first_name", length: 100, type: "varchar" })
  first_name: string;

  @Column({ name: "last_name", length: 100, type: "varchar" })
  last_name: string;

  @Column({ length: 255, unique: true, type: "varchar" })
  email: string;

  @Column({ name: "fk_manager_id", type: "integer" })
  fk_manager_id: number;

  @ManyToOne(() => Manager, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_manager_id" })
  manager: Manager;

  @Column({ name: "is_deleted", type: "smallint", width: 6, default: 0 })
  is_deleted: number;
  // Reference: project_dbml

  @Column({ name: "deleted_at", type: "timestamp", nullable: true })
  deleted_at: Date;

  @Column({ name: "fk_deleted_by", nullable: true })
  fk_deleted_by: number;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
