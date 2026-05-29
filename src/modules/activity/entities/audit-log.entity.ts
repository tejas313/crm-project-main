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

@Entity("audit_logs")
@Index(["module_name"])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "module_name", length: 100, nullable: false })
  module_name: string;

  @Column({ name: "record_id", type: "integer", nullable: false })
  record_id: number;

  @Column({ name: "action", length: 50, nullable: false })
  action: string;

  @Column({ name: "old_value_json", type: "json", nullable: true })
  old_value_json: any;

  @Column({ name: "new_value_json", type: "json", nullable: true })
  new_value_json: any;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @Column({ name: "created_by", type: "integer", nullable: true })
  created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  createdByUser: User;
}
