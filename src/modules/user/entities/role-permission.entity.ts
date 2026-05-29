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
@Index(["fk_module_permission_id"])
@Index(["fk_role_details_id"])
export class RolePermission {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ name: "fk_module_permission_id", type: "int", nullable: true })
  fk_module_permission_id: number;

  @ManyToOne(() => ModulePermission)
  @JoinColumn({ name: "fk_module_permission_id" })
  modulePermission: ModulePermission;

  @Column({ name: "fk_role_details_id", type: "int", nullable: true })
  fk_role_details_id: number;

  @ManyToOne(() => RoleDetails)
  @JoinColumn({ name: "fk_role_details_id" })
  roleDetails: RoleDetails;

  @Column({ name: "is_deleted", type: "smallint", default: 0 })
  is_deleted: number;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @Column({ name: "created_by", type: "int", nullable: true })
  created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @Column({ name: "modify_at", type: "timestamp", nullable: true })
  modify_at: Date;

  @Column({ name: "modify_by", type: "int", nullable: true })
  modify_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "modify_by" })
  modifyBy: User;
}
