import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  UpdateDateColumn,
} from "typeorm";
import { Appointment } from "./appointment.entity";
import { User } from "../../user/entities/user.entity";

@Entity("appointment_history")
@Index(["fk_appointment_id"])
@Index(["action"])
@Index(["created_at"])
export class AppointmentHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_appointment_id", type: "integer" })
  fk_appointment_id: number;

  @ManyToOne(() => Appointment, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_appointment_id" })
  appointment: Appointment;

  @Column({ name: "action", length: 50, type: "varchar" })
  action: string;

  @Column({ name: "old_date", type: "timestamp", nullable: true })
  old_date: Date;

  @Column({ name: "new_date", type: "timestamp", nullable: true })
  new_date: Date;

  @Column({
    name: "old_assign_role",
    length: 50,
    type: "varchar",
    nullable: true,
  })
  old_assign_role: string;

  @Column({
    name: "new_assign_role",
    length: 50,
    type: "varchar",
    nullable: true,
  })
  new_assign_role: string;

  @Column({ name: "fk_old_assign_role_id", type: "integer", nullable: true })
  fk_old_assign_role_id: number;

  @Column({ name: "fk_new_assign_role_id", type: "integer", nullable: true })
  fk_new_assign_role_id: number;

  @Column({ type: "text", nullable: true })
  reason: string;

  @Column({ name: "fk_changed_by_user_id", type: "integer", nullable: true })
  fk_changed_by_user_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_changed_by_user_id" })
  changed_by_user: User;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
