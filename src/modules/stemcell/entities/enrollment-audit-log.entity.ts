import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { SEFEnrollment } from "./sef-enrollment.entity";
import { User } from "../../user/entities/user.entity";

@Entity("enrollment_audit_logs")
@Index(["fk_enrollment_id"])
@Index(["field_name"])
export class EnrollmentAuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_enrollment_id", type: "integer", nullable: false })
  fk_enrollment_id: number;

  @ManyToOne(() => SEFEnrollment, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_enrollment_id" })
  enrollment: SEFEnrollment;

  @Column({
    name: "field_name",
    length: 100,
    nullable: false,
    type: "varchar",
  })
  field_name: string;

  @Column({ name: "old_value", type: "text", nullable: true })
  old_value: string;

  @Column({ name: "new_value", type: "text", nullable: true })
  new_value: string;

  @Column({ name: "change_reason", type: "text", nullable: true })
  change_reason: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @Column({ name: "created_by", type: "integer", nullable: true })
  created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  createdByUser: User;
}
