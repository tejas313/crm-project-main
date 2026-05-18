import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity("google_calendar_integration")
@Index(["fk_user_id"])
@Index(["is_active"])
export class GoogleCalendarIntegration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_user_id", type: "integer", nullable: true })
  fk_user_id: number;

  @OneToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_user_id" })
  user: User;

  @Column({ name: "access_token", type: "text" })
  access_token: string;

  @Column({ name: "refresh_token", type: "text" })
  refresh_token: string;

  @Column({ name: "token_expires_at", type: "timestamp" })
  token_expires_at: Date;

  @Column({ name: "calendar_id", type: "integer", nullable: true })
  calendar_id: string;

  @Column({ name: "is_active", type: "smallint", default: 0 })
  is_active: boolean;

  @Column({ name: "last_sync_at", type: "timestamp", nullable: true })
  last_sync_at: Date;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
