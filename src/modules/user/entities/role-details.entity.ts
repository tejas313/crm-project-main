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
import { User } from "./user.entity";

export enum RoleType {
  ADMIN = "Admin",
  MANAGER = "Manager",
  AGENT = "Agent",
}

@Entity("role_details")
export class RoleDetails {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ name: "role_name", type: "varchar", nullable: false })
  role_name: string;

  @Column({
    name: "role_type",
    type: "enum",
    enum: RoleType,
    nullable: false,
  })
  role_type: RoleType;

  @Column({ name: "is_active", type: "smallint", default: 1 })
  is_active: number;

  @Column({ name: "is_deleted", type: "smallint", default: 0 })
  is_deleted: number;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @Column({ name: "modify_at", type: "timestamp", nullable: true })
  modify_at: Date;

  @Column({ name: "modify_by", type: "int", nullable: true })
  modify_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "modify_by" })
  modify_by_user: User;
}
