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
import { ModulePermission } from "./module-permission.entity";
import { RoleDetails } from "./role-details.entity";
import { User } from "./user.entity";

@Entity("role_permission")
@Index(["module_permission_id"])
@Index(["role_details_id"])
@Index(["id"])
export class RolePermission {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ name: "module_permission_id", type: "int", nullable: true })
  module_permission_id: number;

  @ManyToOne(() => ModulePermission)
  @JoinColumn({ name: "module_permission_id" })
  modulePermission: ModulePermission;

  @Column({ name: "role_details_id", type: "int", nullable: true })
  role_details_id: number;

  @ManyToOne(() => RoleDetails)
  @JoinColumn({ name: "role_details_id" })
  roleDetails: RoleDetails;

  @Column({ name: "is_deleted", type: "smallint", width: 6, default: 0 })
  is_deleted: number;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @Column({ name: "created_by", type: "int", nullable: true })
  created_by_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @Column({ name: "modify_at", type: "timestamp", nullable: true })
  modify_at: Date;

  @Column({ name: "modify_by", type: "int", nullable: true })
  modify_by_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "modify_by" })
  modifyBy: User;
}
