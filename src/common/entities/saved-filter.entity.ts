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
import { User } from "../../modules/user/entities/user.entity";

@Entity("saved_filters")
@Index(["fk_user_id"])
@Index(["filter_type"])
@Index(["is_default"])
export class SavedFilter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fk_user_id" })
  fk_user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "fk_user_id" })
  user: User;

  @Column({ name: "filter_name", length: 255 })
  filter_name: string;

  @Column({ name: "filter_type", length: 50 })
  filter_type: string;

  @Column({ name: "filter_conditions", type: "json" })
  filter_conditions: any;

  @Column({ name: "is_default", default: false })
  is_default: boolean;

  @Column({ name: "is_shared", default: false })
  is_shared: boolean;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
