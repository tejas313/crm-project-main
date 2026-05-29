import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
} from "class-validator";

// Lead Medium enum as per URS
export enum LeadMedium {
  DIGITAL = "Digital",
  REFERRAL = "Referral",
  HOSPITAL = "Hospital",
  PARTNERS = "Partners",
  FMR = "FMR",
}

// Lead Sources as per URS
export enum ManualLeadSource {
  DIGITAL_CS_REFERRAL = "Digital - CS Referral",
  DIGITAL_FACEBOOK = "Digital - Facebook",
  DIGITAL_FACEBOOK_INBOUND = "Digital - Facebook Inbound",
  DIGITAL_GOOGLE_INBOUND = "Digital - Google Inbound",
  DIGITAL_INBOUND = "Digital - Inbound",
  DIGITAL_JUSTDIAL = "Digital - Justdial",
  DIGITAL_NITRO = "Digital - Nitro",
  DIGITAL_SEM = "Digital - SEM",
  DIGITAL_WEBSITE = "Digital - Website",
  DIGITAL_WEBSITE_INBOUND = "Digital - Website Inbound",
  INBOUND_CALL = "inbound call",
  DIGITAL_INSTAGRAM = "Digital - Instagram",
  DIGITAL_HOSPITAL = "Digital - Hospital",
  DIGITAL_WEBINAR = "Digital - Webinar",
  DIGITAL_NIPT_PNS = "Digital - NIPT / PNS",
  DIGITAL_REFER_A_FRIEND = "Digital - Refer A Friend Lead",
  DIGITAL_REFERRAL_RCS = "Digital - Referral RCS",
  DIGITAL_REFERRAL = "Digital Referral",
  DIGITAL_RAINBOW_REFERRAL = "Digital-Rainbow Referral",
  REFER_A_FRIEND_LEAD = "Refer a friend lead",
  REFERRAL_EC = "Referral EC",
}

// Interested Products as per URS
export enum InterestedProduct {
  BIO_BANK = "Bio Bank",
  DIAGNOSTICS = "Diagnostics",
  BIOLOGICS = "Biologics",
  OTHERS = "Others",
}

export class CreateLeadDto {
  @ApiProperty({ example: "John", description: "First name of the customer" })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    example: "Doe",
    description: "Last name of the customer",
    required: false,
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({
    example: "john.doe@example.com",
    description: "Email address",
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

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
    required: false,
  })
  @IsString()
  @IsOptional()
  alternate_phone?: string;

  @ApiProperty({
    example: "john.alternate@example.com",
    description: "Alternate email ID",
    required: false,
  })
  @IsEmail()
  @IsOptional()
  alternate_email?: string;

  @ApiProperty({
    example: "SRC123",
    description: "Source ID",
    required: false,
  })
  @IsString()
  @IsOptional()
  source_id?: any;

  @ApiProperty({
    example: "MED123",
    description: "Medium ID",
    required: false,
  })
  @IsString()
  @IsOptional()
  medium_id?: any;

  @ApiProperty({
    example: LeadMedium.DIGITAL,
    enum: LeadMedium,
    description: "Lead Medium (mandatory)",
  })
  @IsEnum(LeadMedium)
  @IsNotEmpty()
  medium: LeadMedium;

  @ApiProperty({
    example: ManualLeadSource.DIGITAL_WEBSITE,
    enum: ManualLeadSource,
    description: "Lead Source (mandatory)",
  })
  @IsEnum(ManualLeadSource)
  @IsNotEmpty()
  lead_source: ManualLeadSource;

  @ApiProperty({
    example: "2026-12-31",
    description: "Pregnancy EDD (Calendar option, no backdating)",
    required: false,
  })
  @IsDateString()
  @IsOptional()
  pregnancy_edd?: string;

  @ApiProperty({
    example: "Campaign ABC",
    description: "Campaign Name",
    required: false,
  })
  @IsString()
  @IsOptional()
  campaign_name?: string;

  @ApiProperty({
    example: "Type A",
    description: "Campaign Type",
    required: false,
  })
  @IsString()
  @IsOptional()
  campaign_type?: string;

  @ApiProperty({
    example: "CRM12345",
    description: "Referrer CRM number",
    required: false,
  })
  @IsString()
  @IsOptional()
  referrer_crm_number?: string;

  @ApiProperty({
    example: [InterestedProduct.BIO_BANK, InterestedProduct.DIAGNOSTICS],
    enum: InterestedProduct,
    isArray: true,
    description: "Interested products",
    required: false,
  })
  @IsArray()
  @IsEnum(InterestedProduct, { each: true })
  @IsOptional()
  interested_products?: InterestedProduct[];

  @ApiProperty({
    example: "Customer called and expressed interest in stem cell banking.",
    description: "Initial note to attach to the lead",
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}
