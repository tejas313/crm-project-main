import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber, IsEnum } from "class-validator";
import { TaskStatus, TaskType } from "../entities/task.entity";

export class TaskListFiltersDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  pageNumber?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  pageLimit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ required: false, enum: TaskType })
  @IsOptional()
  @IsEnum(TaskType)
  task_type?: TaskType;

  @ApiProperty({ required: false })
  @IsOptional()
  is_csv?: number;
}
