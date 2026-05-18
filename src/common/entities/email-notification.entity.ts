import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Lead } from "../../modules/lead/entities/lead.entity";
import { User } from "../../modules/user/entities/user.entity";
import { Task } from "../../modules/task/entities/task.entity";

@Entity("email_notifications")
@Index(["fk_lead_id"])
@Index(["fk_user_id"])
@Index(["fk_task_id"])
@Index(["email_type"])
@Index(["status"])
@Index(["sent_at"])
export class EmailNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_lead_id", nullable: true })
  fk_lead_id: number;

  @ManyToOne(() => Lead)
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "fk_user_id", nullable: true })
  fk_user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "fk_user_id" })
  user: User;

  @Column({ name: "fk_task_id", nullable: true })
  fk_task_id: number;

  @ManyToOne(() => Task)
  @JoinColumn({ name: "fk_task_id" })
  task: Task;

  @Column({ name: "email_to", length: 255 })
  email_to: string;

  @Column({ name: "email_subject", length: 500 })
  email_subject: string;

  @Column({ name: "email_body", type: "text" })
  email_body: string;

  @Column({ name: "email_type", length: 100 })
  email_type: string;

  @Column({ name: "sent_at", type: "timestamp", nullable: true })
  sent_at: Date;

  @Column({ name: "status", length: 50, default: "pending" })
  status: string;

  @Column({ name: "error_message", type: "text", nullable: true })
  error_message: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
