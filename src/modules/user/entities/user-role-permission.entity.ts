import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { ChildPermission } from "./child-permission.entity";

@Entity("user_role_permission")
export class UserRolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_child_permission_id", type: "integer" })
  fk_child_permission_id: number;

  @ManyToOne(() => ChildPermission, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "fk_child_permission_id" })
  childpermission: ChildPermission;

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
