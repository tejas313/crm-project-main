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

@Entity("user_session")
@Index(["fk_user_id"])
@Index(["expires_at"])
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_user_id", type: "integer", nullable: false })
  fk_user_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_user_id" })
  user: User;

  @Column({ name: "token", length: 255, unique: true, nullable: false })
  token: string;

  @Column({ name: "expires_at", type: "timestamp", nullable: false })
  expires_at: Date;

  @Column({ name: "refresh_token", length: 255, unique: true, nullable: false })
  refresh_token: string;

  @Column({ name: "refresh_expires_at", type: "timestamp", nullable: false })
  refresh_expires_at: Date;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
