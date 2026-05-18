import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
} from "class-validator";

export class ManagerDto {
  @ApiProperty({
    example: 1,
    description: "ID of the manager (leave empty for add)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ example: "John" })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: "Doe" })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: "manager@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "1234567890", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: "SecurePass123!",
    required: false,
    description: "Password (optional, auto-generated if not provided)",
  })
  @IsOptional()
  @IsString()
  password?: string;
}

export class AgentDto {
  @ApiProperty({
    example: 1,
    description: "ID of the agent (leave empty for add)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ example: "Jane" })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: "Smith" })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: "agent@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "9876543210", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: "SecurePass123!",
    required: false,
    description: "Password (optional, auto-generated if not provided)",
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: 1, description: "ID of the manager" })
  @IsNumber()
  @IsNotEmpty()
  fk_manager_id: number;
}

export class AgentLeaveDto {
  @ApiProperty({ example: "2026-05-15" })
  @IsNotEmpty()
  @IsString()
  leave_start_date: string;

  @ApiProperty({ example: "2026-05-16" })
  @IsNotEmpty()
  @IsString()
  leave_end_date: string;

  @ApiProperty({ example: "Paid leave" })
  @IsOptional()
  @IsString()
  leave_type?: string;

  @ApiProperty({ example: "Going out of town" })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class LeaveListDto {
  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  pageNumber: number;

  @ApiProperty({ example: 10, required: true })
  @IsNotEmpty()
  pageLimit: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  is_csv?: number;
}

export class AddUserPermissionsDto {
  // user id to which permissions will be assigned
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  fk_user_id: number;

  // array of child permission ids
  @ApiProperty({ example: [1, 2, 3] })
  @IsNotEmpty()
  permissions: number[];
}
