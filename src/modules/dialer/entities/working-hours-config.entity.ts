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
import { User } from "../../user/entities/user.entity";

@Entity("working_hours_config")
@Index(["day_of_week"])
@Index(["is_working_day"])
export class WorkingHoursConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "day_of_week", type: "integer", nullable: false })
  day_of_week: number;

  @Column({ name: "start_time", type: "time", nullable: false })
  start_time: string;

  @Column({ name: "end_time", type: "time", nullable: false })
  end_time: string;

  @Column({ name: "is_working_day", type: "smallint", default: 0 })
  is_working_day: number;

  @Column({ name: "timezone", length: 50, default: "Asia/Kolkata" })
  timezone: string;

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
