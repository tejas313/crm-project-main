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
import { User } from "../../modules/user/entities/user.entity";

@Entity("saved_filters")
@Index(["id"])
@Index(["fk_user_id"])
@Index(["filter_type"])
@Index(["is_default"])
export class SavedFilter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_user_id", type: "integer", nullable: false })
  fk_user_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_user_id" })
  user: User;

  @Column({ name: "filter_name", length: 255, nullable: false })
  filter_name: string;

  @Column({ name: "filter_type", length: 50, nullable: false })
  filter_type: string;

  @Column({ name: "filter_conditions", type: "json", nullable: false })
  filter_conditions: any;

  @Column({ name: "is_default", type: "boolean", default: false })
  is_default: boolean;

  @Column({ name: "is_shared", type: "boolean", default: false })
  is_shared: boolean;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @Column({ name: "created_by", type: "integer", nullable: true })
  created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  createdByUser: User;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @Column({ name: "modify_at", type: "timestamp", nullable: true })
  modify_at: Date;

  @Column({ name: "modify_by", type: "integer", nullable: true })
  modify_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "modify_by" })
  modifyByUser: User;
}
