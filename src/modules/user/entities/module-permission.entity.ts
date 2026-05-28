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
import { Module } from "./module.entity";

@Entity("module_permission")
@Index(["module_id"])
@Index(["id"])
export class ModulePermission {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ name: "module_id", type: "int", nullable: true })
  module_id: number;

  @ManyToOne(() => Module)
  @JoinColumn({ name: "module_id" })
  module: Module;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ name: "is_deleted", type: "smallint", width: 6, default: 0 })
  is_deleted: number;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
