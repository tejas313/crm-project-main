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
@Index(["fk_module_id"])
export class ModulePermission {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ name: "fk_module_id", type: "int", nullable: true })
  fk_module_id: number;

  @ManyToOne(() => Module, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_module_id" })
  module: Module;

  @Column({ name: "name", type: "varchar", nullable: false })
  name: string;

  @Column({ name: "is_deleted", type: "smallint", default: 0 })
  is_deleted: number;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
