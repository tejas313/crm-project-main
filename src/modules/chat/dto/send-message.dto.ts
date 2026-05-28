import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { MessageType } from "../entities/chat-message.entity";

export class SendMessageDto {
  @ApiProperty({
    description: "Lead ID to associate message with",
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  lead_id: number;

  @ApiProperty({
    description: "Message content to send",
    example: "Hello! How can I help you today?",
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: "Type of message",
    enum: MessageType,
    default: MessageType.TEXT,
  })
  @IsOptional()
  @IsEnum(MessageType)
  message_type?: MessageType;

  @ApiPropertyOptional({
    description: "Media URL for image/document/audio/video messages",
    example: "https://example.com/image.jpg",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  media_url?: string;

  @ApiPropertyOptional({
    description: "Caption for media messages",
    example: "Product brochure",
  })
  @IsOptional()
  @IsString()
  media_caption?: string;
}
