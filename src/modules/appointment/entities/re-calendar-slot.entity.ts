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
import { Appointment } from "../../appointment/entities/appointment.entity";

export enum CalendarSlotStatus {
  AVAILABLE = "Available",
  BOOKED = "Booked",
  BLOCKED = "Blocked",
  TENTATIVE = "Tentative",
}

@Entity("re_calendar_slots")
@Index(["re_id"])
@Index(["slot_date"])
@Index(["slot_status"])
export class RECalendarSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "re_id", type: "integer" })
  re_id: number;

  @Column({ name: "slot_date", type: "date" })
  slot_date: Date;

  @Column({ name: "slot_start_time", type: "time" })
  slot_start_time: string;

  @Column({ name: "slot_end_time", type: "time" })
  slot_end_time: string;

  @Column({
    name: "slot_status",
    type: "enum",
    enum: CalendarSlotStatus,
    default: CalendarSlotStatus.AVAILABLE,
  })
  slot_status: CalendarSlotStatus;

  @Column({ name: "fk_appointment_id", nullable: true })
  fk_appointment_id: number;

  @ManyToOne(() => Appointment, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_appointment_id" })
  appointment: Appointment;

  @Column({ type: "text", nullable: true })
  notes: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
