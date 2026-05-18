import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("main_permission")
export class MainPermission {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  name: string;

  @Column({ name: "is_deleted", type: "smallint", width: 6, default: 0 })
  is_deleted: number;

  @Column({ name: "deleted_at", type: "timestamp", nullable: true })
  deleted_at: Date;

  @Column({ name: "fk_deleted_by", type: "integer", nullable: true })
  fk_deleted_by: number;

  @CreateDateColumn({
    name: "created_at",
  })
  created_at: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updated_at: Date;
}
