import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({
    example: "oldPassword123",
    description: "Current password of the user",
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    example: "newPassword123",
    description: "New password of the user",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
