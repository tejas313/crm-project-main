import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("automations")
@Index(["automation_type"])
@Index(["is_active"])
export class Automation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, type: "varchar" })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: "automation_type", length: 100 })
  automation_type: string;

  @Column({ name: "flow_definition", type: "json" })
  flow_definition: any;

  @Column({ name: "is_active", type: "smallint", default: 0 })
  is_active: number;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
