import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { RoleDetails } from "./role-details.entity";

export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  AGENT = "Agent",
}

@Entity("users")
@Index(["id"])
@Index(["email"])
@Index(["is_active"])
@Index(["role_id"])
@Index(["last_login_at"])
export class User {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  email: string;

  @Column({ name: "first_name", length: 255, type: "varchar", nullable: false })
  first_name: string;

  @Column({ name: "last_name", length: 255, type: "varchar", nullable: false })
  last_name: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  password: string;

  @Column({ name: "role_id", type: "int", nullable: true })
  role_id: number;

  @ManyToOne(() => RoleDetails, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  roleDetails: RoleDetails;

  @Column({ name: "fk_manager_id", type: "int", nullable: true })
  fk_manager_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "fk_manager_id" })
  manager: User;

  @Column({ name: "is_active", type: "boolean", default: true })
  is_active: boolean;

  @Column({ name: "is_blocked", type: "boolean", default: false })
  is_blocked: boolean;

  @Column({ name: "password_changed_at", type: "timestamp", nullable: true })
  password_changed_at: Date;

  @Column({ name: "last_login_at", type: "timestamp", nullable: true })
  last_login_at: Date;

  @Column({ name: "otp_code", length: 10, type: "varchar", nullable: true })
  otp_code: string;

  @Column({ name: "otp_expiry", type: "timestamp", nullable: true })
  otp_expiry: Date;

  @Column({ name: "is_deleted", type: "smallint", width: 6, default: 0 })
  is_deleted: number;

  @Column({ name: "deleted_at", type: "timestamp", nullable: true })
  deleted_at: Date;

  @Column({ name: "deleted_by", type: "int", nullable: true })
  deleted_by: number;

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

  // Keep phone and role for backward compatibility with existing code
  @Column({ name: "phone", length: 20, type: "varchar", nullable: true })
  phone: string;

  @Column({ type: "enum", enum: UserRole, nullable: true })
  role: UserRole;
}
// Reference: project_dbml
