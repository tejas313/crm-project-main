import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./user.entity";

@Entity("user_sessions")
@Index(["fk_user_id"])
@Index(["expires_at"])
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_user_id", type: "integer" })
  fk_user_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_user_id" })
  user: User;

  @Column({ name: "token", length: 255, unique: true, type: "varchar" })
  token: string;

  @Column({ name: "expires_at", type: "timestamp" })
  expires_at: Date;

  @Column({ name: "refresh_token", length: 255, unique: true, type: "varchar" })
  refresh_token: string;

  @Column({ name: "refresh_expires_at", type: "timestamp" })
  refresh_expires_at: Date;

  @Column({ name: "used_at", type: "timestamp", nullable: true })
  used_at: Date;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
