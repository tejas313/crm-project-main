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
    description: "Filter by lead status ID",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lead_status?: number;

  @ApiPropertyOptional({
    description: "Filter by lead source ID",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lead_source?: number;

  @ApiPropertyOptional({
    description: "Filter by medium ID",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  medium?: number;

  @ApiPropertyOptional({
    description: "Filter by owner ID",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  owner_id?: number;

  @ApiPropertyOptional({
    description: "Filter by lead stage",
    example: "New",
    enum: LeadStage,
  })
  @IsOptional()
  lead_stage?: LeadStage;
}
