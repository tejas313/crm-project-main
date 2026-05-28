import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Matches,
} from "class-validator";
import { UserRole } from "./entities/user.entity";

export class AddOrEditUserDto {
  @ApiProperty({
    example: 1,
    description: "ID of the user (leave empty for add, provide for edit)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    example: "Manager",
    description: "User role: Manager or Agent",
    enum: [UserRole.MANAGER, UserRole.AGENT],
  })
  @IsEnum([UserRole.MANAGER, UserRole.AGENT], {
    message: "Role must be either Manager or Agent",
  })
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ example: "John" })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: "Doe" })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: "user@example.com" })
  @IsEmail({}, { message: "Invalid email format" })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "1234567890", required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,15}$/, {
    message: "Phone number must be between 10 to 15 digits",
  })
  phone?: string;

  @ApiProperty({
    example: "SecurePass123!",
    required: false,
    description: "Password (optional, auto-generated if not provided)",
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    example: 1,
    description: "ID of the manager (required only for Agent role)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  fk_manager_id?: number;

  @ApiProperty({
    example: 1,
    description: "ID of the role (from role_details table)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  role_id?: number;
}

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

export class AddRolePermissionsDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  role_details_id: number;

  @ApiProperty({ example: [1, 2, 3] })
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  module_permission_id: number[];
}

export class UserListFiltersDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  pageNumber?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  pageLimit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: [UserRole.MANAGER, UserRole.AGENT] })
  @IsOptional()
  @IsEnum([UserRole.MANAGER, UserRole.AGENT])
  role?: UserRole;

  @ApiProperty({ required: false, enum: ["Active", "Blocked"] })
  @IsOptional()
  @IsString()
  status?: "Active" | "Blocked";

  @ApiProperty({ required: false })
  @IsOptional()
  is_csv?: number;
}

export class UserByIdDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
