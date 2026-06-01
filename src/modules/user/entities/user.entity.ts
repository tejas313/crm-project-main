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

@Entity("users")
@Index(["is_active"])
@Index(["fk_role_id"])
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

  @Column({ name: "fk_role_id", type: "int", nullable: true })
  fk_role_id: number;

  @ManyToOne(() => RoleDetails, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_role_id" })
  roleDetails: RoleDetails;

  @Column({
    name: "phone",
    length: 255,
    type: "varchar",
    unique: true,
    nullable: false,
  })
  phone: string;

  @Column({ name: "fk_manager_id", type: "int", nullable: true })
  fk_manager_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_manager_id" })
  manager: User;

  @Column({ name: "is_active", type: "smallint", default: 1 })
  is_active: number;

  @Column({ name: "password_changed_at", type: "timestamp", nullable: true })
  password_changed_at: Date;

  @Column({ name: "last_login_at", type: "timestamp", nullable: true })
  last_login_at: Date;

  @Column({ name: "otp_code", length: 10, type: "varchar", nullable: true })
  otp_code: string;

  @Column({ name: "otp_expiry", type: "timestamp", nullable: true })
  otp_expiry: Date;

  @Column({ name: "is_deleted", type: "smallint", default: 0 })
  is_deleted: number;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @Column({ name: "created_by", type: "int", nullable: true })
  created_by: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @Column({ name: "modify_at", type: "timestamp", nullable: true })
  modify_at: Date;

  @Column({ name: "modify_by", type: "int", nullable: true })
  modify_by: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "modify_by" })
  modifyBy: User;
}
