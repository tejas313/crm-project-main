import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
  ManyToOne,
} from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity("google_calendar_integration")
@Index(["is_active"])
export class GoogleCalendarIntegration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_user_id", unique: true, type: "integer", nullable: false })
  fk_user_id: number;

  @OneToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_user_id" })
  user: User;

  @Column({ name: "access_token", type: "text", nullable: false })
  access_token: string;

  @Column({ name: "refresh_token", type: "text", nullable: false })
  refresh_token: string;

  @Column({ name: "token_expires_at", type: "timestamp", nullable: false })
  token_expires_at: Date;

  @Column({ name: "calendar_id", length: 255, nullable: true })
  calendar_id: string;

  @Column({ name: "is_active", type: "smallint", default: 1 })
  is_active: number;

  @Column({ name: "last_sync_at", type: "timestamp", nullable: true })
  last_sync_at: Date;

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
