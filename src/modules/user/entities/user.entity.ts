import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  AGENT = "Agent",
}

@Entity("users")
@Index(["id"])
@Index(["email"])
@Index(["role"])
@Index(["is_active"])
@Index(["role_id"])
export class User {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  password: string;

  @Column({ type: "enum", enum: UserRole, nullable: false })
  role: UserRole;

  @Column({ name: "role_id", type: "integer", nullable: true })
  role_id: number;

  @Column({ name: "is_active", type: "boolean", default: true })
  is_active: boolean;

  @Column({ name: "is_blocked", type: "boolean", default: false })
  is_blocked: boolean;

  @Column({ name: "password_changed_at", type: "timestamp", nullable: true })
  password_changed_at: Date;

  @Column({ name: "is_deleted", type: "smallint", width: 6, default: 0 })
  is_deleted: number;

  @Column({ name: "deleted_at", type: "timestamp", nullable: true })
  deleted_at: Date;

  @Column({ name: "fk_deleted_by", type: "integer", nullable: true })
  fk_deleted_by: number;

  @CreateDateColumn({
    name: "created_at",
  })
  created_at: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updated_at: Date;
}
// Reference: project_dbml
