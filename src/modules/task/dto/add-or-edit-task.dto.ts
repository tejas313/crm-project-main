import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
} from "class-validator";
import { TaskType, TaskStatus } from "../entities/task.entity";

export class AddOrEditTaskDto {
  @ApiProperty({
    example: 1,
    description: "ID of the task (leave empty for add, provide for edit)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    example: "Follow up with client",
    description: "Subject of the task",
  })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({
    example: 1,
    description: "Associated Lead ID",
  })
  @IsNotEmpty()
  @IsNumber()
  fk_lead_id: number;

  @ApiProperty({
    example: 2,
    description: "Owner ID (User/Agent)",
  })
  @IsNotEmpty()
  @IsNumber()
  fk_owner_id: number;

  @ApiProperty({
    example: "2026-05-20T14:30:00.000Z",
    description: "Scheduled date and time of the task",
  })
  @IsNotEmpty()
  @IsDateString()
  scheduled_at: string;

  @ApiProperty({
    example: 15,
    description: "Reminder minutes before scheduled_at (optional)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  reminder_minutes?: number;

  @ApiProperty({
    example: "2026-05-20T14:15:00.000Z",
    description: "Explicit reminder date and time (optional)",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  reminder_at?: string;

  @ApiProperty({
    example: "Discuss pricing options",
    description: "Detailed description of the task",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: "General",
    description:
      "Task type: Call, Follow up, Appointment, Presentation, General",
    enum: TaskType,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskType)
  task_type?: TaskType;

  @ApiProperty({
    example: "medium",
    description: "Priority: low, medium, high",
    required: false,
  })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({
    example: "Pending",
    description: "Task status: Pending, Overdue, Completed, Cancelled",
    enum: TaskStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    example: "Client was busy",
    description: "Notes when task is completed or updated",
    required: false,
  })
  @IsOptional()
  @IsString()
  completion_notes?: string;

  @ApiProperty({
    example: "Client requested to postpone",
    description: "Reason if task is cancelled",
    required: false,
  })
  @IsOptional()
  @IsString()
  cancellation_reason?: string;
}
