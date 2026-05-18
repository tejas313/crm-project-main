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
import { Lead } from "./lead.entity";
import { User } from "../../user/entities/user.entity";

@Entity("notes")
@Index(["fk_lead_id"])
@Index(["fk_created_by_user_id"])
@Index(["created_at"])
@Index(["is_deleted"])
@Index(["is_pinned"])
export class Notes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", type: "integer" })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ type: "text" })
  note: string;

  @Column({ name: "is_pinned", default: 0, type: "smallint" })
  is_pinned: number;

  @Column({ name: "is_important", default: 0, type: "smallint" })
  is_important: number;

  @Column({ name: "fk_created_by_user_id" })
  fk_created_by_user_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_created_by_user_id" })
  created_by_user: User;

  @Column({ name: "is_deleted", type: "smallint", width: 6, default: 0 })
  is_deleted: number;
  // Reference: project_dbml

  @Column({ name: "deleted_at", type: "timestamp", nullable: true })
  deleted_at: Date;

  @Column({ name: "fk_deleted_by", nullable: true })
  fk_deleted_by: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_deleted_by" })
  deleted_by: User;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
