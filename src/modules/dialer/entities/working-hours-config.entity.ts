import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("working_hours_config")
@Index(["day_of_week"])
@Index(["is_working_day"])
export class WorkingHoursConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: "day_of_week",
    type: "integer",
    comment: "0=Sunday, 1=Monday, ..., 6=Saturday",
  })
  day_of_week: number;

  @Column({ name: "start_time", type: "time" })
  start_time: string;

  @Column({ name: "end_time", type: "time" })
  end_time: string;

  @Column({ name: "is_working_day", default: true })
  is_working_day: boolean;

  @Column({ name: "timezone", length: 50, default: "Asia/Kolkata" })
  timezone: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
