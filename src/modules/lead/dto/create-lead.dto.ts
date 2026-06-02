import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
} from "class-validator";

export class CreateLeadDto {
  @ApiProperty({
    example: 1,
    description: "ID of the lead (provide for update)",
    required: false,
  })
  @IsOptional()
  id?: number;

  @ApiProperty({
    example: 1,
    description: "Lead status ID",
    required: false,
  })
  @IsOptional()
  fk_lead_status_id?: number;

  @ApiProperty({
    example: "New",
    description: "Lead Stage",
    required: false,
  })
  @IsOptional()
  lead_stage?: string;

  @ApiProperty({
    example: 1,
    description: "Owner ID",
    required: false,
  })
  @IsOptional()
  fk_owner_id?: number;

  @ApiProperty({ example: "John", description: "First name of the customer" })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    example: "Doe",
    description: "Last name of the customer",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    example: "john.doe@example.com",
    description: "Email address",
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: "9876543210",
    description: "Phone number (mandatory)",
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: "9876543211",
    description: "Alternate mobile number",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  alternate_phone: string;

  @ApiProperty({
    example: "john.alternate@example.com",
    description: "Alternate email ID",
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  alternate_email: string;

  @ApiProperty({
    example: "1",
    description: "Source ID",
    required: true,
  })
  @IsNotEmpty()
  source_id: any;

  @ApiProperty({
    example: "1",
    description: "Medium ID",
    required: true,
  })
  @IsNotEmpty()
  medium_id: any;

  @ApiProperty({
    example: "2026-12-31",
    description: "Pregnancy EDD (Calendar option, no backdating)",
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  pregnancy_edd: string;

  @ApiProperty({
    example: "Campaign ABC",
    description: "Campaign Name",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  campaign_name: string;

  @ApiProperty({
    example: "Type A",
    description: "Campaign Type",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  campaign_type: string;

  @ApiProperty({
    example: "CRM12345",
    description: "Referrer CRM number",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  referrer_crm_number: string;

  @ApiProperty({
    example: 1,
    description: "Interested product ID",
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  fk_interested_product_id: number;

  @ApiProperty({
    example: "Customer called and expressed interest in stem cell banking.",
    description: "Initial note to attach to the lead",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  note: string;
}
