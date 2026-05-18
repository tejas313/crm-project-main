import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../user/entities/user.entity";

export enum BulkOperationType {
  UPLOAD = "Upload",
  EDIT = "Edit",
  DELETE = "Delete",
  EXPORT = "Export",
  STATUS_UPDATE = "Status update",
}

@Entity("bulk_operation_logs")
@Index(["operation_type"])
@Index(["fk_performed_by_user_id"])
@Index(["status"])
@Index(["started_at"])
export class BulkOperationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "operation_type", type: "enum", enum: BulkOperationType })
  operation_type: BulkOperationType;

  @Column({ name: "file_name", type: "varchar", length: 255, nullable: true })
  file_name: string;

  @Column({ name: "file_path", type: "varchar", length: 500, nullable: true })
  file_path: string;

  @Column({ name: "total_records", default: 0 })
  total_records: number;

  @Column({ name: "successful_records", default: 0 })
  successful_records: number;

  @Column({ name: "failed_records", default: 0 })
  failed_records: number;

  @Column({ name: "error_log", type: "json", nullable: true })
  error_log: any;

  @Column({ name: "fk_performed_by_user_id", type: "integer" })
  fk_performed_by_user_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_performed_by_user_id" })
  performed_by_user: User;

  @Column({ name: "started_at", type: "timestamp" })
  started_at: Date;

  @Column({ name: "completed_at", type: "timestamp", nullable: true })
  completed_at: Date;

  @Column({ name: "status", length: 50, default: "in_progress" })
  status: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
