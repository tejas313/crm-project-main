import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { BulkOperationLog } from "./bulk-operation-log.entity";
import { Lead } from "./lead.entity";

@Entity("lead_import_history")
@Index(["fk_bulk_operation_id"])
@Index(["fk_lead_id"])
@Index(["import_status"])
export class LeadImportHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_bulk_operation_id", type: "integer", nullable: true })
  fk_bulk_operation_id: number;

  @ManyToOne(() => BulkOperationLog, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "fk_bulk_operation_id" })
  bulk_operation: BulkOperationLog;

  @Column({ name: "fk_lead_id", nullable: true, type: "integer" })
  fk_lead_id: number;

  @ManyToOne(() => Lead, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "fk_lead_id" })
  lead: Lead;

  @Column({ name: "row_number", type: "integer" })
  row_number: number;

  @Column({ name: "import_data", type: "json" })
  import_data: any;

  @Column({ name: "import_status", length: 50 })
  import_status: string;

  @Column({ name: "error_message", type: "text", nullable: true })
  error_message: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
