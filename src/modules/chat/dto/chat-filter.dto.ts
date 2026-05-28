import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class GetChatHistoryDto {
  @ApiProperty({
    description: "Lead ID to get chat history for",
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  lead_id: number;

  @ApiPropertyOptional({
    description: "Page number for pagination",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: "Number of messages per page",
    example: 50,
    default: 50,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class GetConversationListDto {
  @ApiPropertyOptional({
    description: "Search by customer name or phone",
    example: "9876543210",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Page number for pagination",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: "Number of conversations per page",
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
