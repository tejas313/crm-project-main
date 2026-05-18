import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("stemcell_api_logs")
@Index(["sync_queue_id"])
@Index(["endpoint"])
@Index(["is_success"])
@Index(["created_at"])
export class StemcellApiLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "sync_queue_id", nullable: true, type: "integer" })
  sync_queue_id: number;

  @Column({ length: 255 })
  endpoint: string;

  @Column({ name: "http_method", length: 10 })
  http_method: string;

  @Column({ name: "request_payload", type: "json", nullable: true })
  request_payload: any;

  @Column({ name: "response_payload", type: "json", nullable: true })
  response_payload: any;

  @Column({ name: "http_status_code", nullable: true })
  http_status_code: number;

  @Column({ name: "response_time_ms", nullable: true })
  response_time_ms: number;

  @Column({ name: "is_success", default: false })
  is_success: boolean;

  @Column({ name: "error_message", type: "text", nullable: true })
  error_message: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
