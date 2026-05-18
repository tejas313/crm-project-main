import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { MainPermission } from "./main-permission.entity";
import { User } from "./user.entity";

@Entity("child_permission")
export class ChildPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  name: string;

  @Column({ name: "fk_main_permission_id", type: "integer" })
  fk_main_permission_id: number;

  @ManyToOne(() => MainPermission, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_main_permission_id" })
  mainpermission: MainPermission;

  @Column({ name: "fk_user_id", type: "integer" })
  fk_user_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_user_id" })
  userId: User;

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
