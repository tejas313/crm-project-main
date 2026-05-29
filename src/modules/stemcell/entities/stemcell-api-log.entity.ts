import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("stemcell_api_logs")
@Index(["is_success"])
@Index(["created_at"])
export class StemcellApiLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "url", length: 255, nullable: false })
  url: string;

  @Column({ name: "request_payload", type: "json", nullable: true })
  request_payload: any;

  @Column({ name: "response_payload", type: "json", nullable: true })
  response_payload: any;

  @Column({ name: "is_success", type: "smallint", default: 0 })
  is_success: number;

  @Column({ name: "error_message", type: "text", nullable: true })
  error_message: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
