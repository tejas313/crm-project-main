import { IsOptional, IsString, IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { LeadStage } from "../entities/lead.entity";

export class LeadListFiltersDto {
  @ApiPropertyOptional({
    description: "Page number for pagination",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageNumber?: number;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageLimit?: number;

  @ApiPropertyOptional({
    description: "Search term for name, email, phone, or campaign name",
    example: "John",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Export data as CSV (1 for CSV, 0 for JSON)",
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  is_csv?: number;

  @ApiPropertyOptional({
    description: "Filter by lead status (single or array)",
    example: "New lead",
  })
  @IsOptional()
  lead_status?: string | string[];

  @ApiPropertyOptional({
    description: "Filter by lead source (single or array)",
    example: "Facebook",
  })
  @IsOptional()
  lead_source?: string | string[];

  @ApiPropertyOptional({
    description: "Filter by medium (single or array)",
    example: "Paid Ads",
  })
  @IsOptional()
  medium?: string | string[];

  @ApiPropertyOptional({
    description: "Filter by owner ID (single or array)",
    example: 1,
  })
  @IsOptional()
  owner_id?: number | number[];

  @ApiPropertyOptional({
    description: "Filter leads created from this date (YYYY-MM-DD)",
    example: "2026-01-01",
  })
  @IsOptional()
  @IsString()
  date_from?: string;

  @ApiPropertyOptional({
    description: "Filter leads created until this date (YYYY-MM-DD)",
    example: "2026-12-31",
  })
  @IsOptional()
  @IsString()
  date_to?: string;

  @ApiPropertyOptional({
    description: "Filter by pregnancy EDD from this date (YYYY-MM-DD)",
    example: "2026-06-01",
  })
  @IsOptional()
  @IsString()
  pregnancy_edd_from?: string;

  @ApiPropertyOptional({
    description: "Filter by pregnancy EDD until this date (YYYY-MM-DD)",
    example: "2026-12-31",
  })
  @IsOptional()
  @IsString()
  pregnancy_edd_to?: string;

  @ApiPropertyOptional({
    description: "Filter by state ID (single or array)",
    example: 1,
  })
  @IsOptional()
  state_id?: number | number[];

  @ApiPropertyOptional({
    description: "Filter by city ID (single or array)",
    example: 1,
  })
  @IsOptional()
  city_id?: number | number[];

  @ApiPropertyOptional({
    description: "Filter by lead stage (single or array)",
    example: "New",
    enum: LeadStage,
  })
  @IsOptional()
  lead_stage?: LeadStage | LeadStage[];

  @ApiPropertyOptional({
    description: "Filter by manual lead flag (0 or 1)",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  is_manually?: number;

  @ApiPropertyOptional({
    description: "Filter by campaign name",
    example: "Summer Campaign",
  })
  @IsOptional()
  @IsString()
  campaign_name?: string;
}
