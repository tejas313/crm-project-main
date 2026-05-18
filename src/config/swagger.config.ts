import { DocumentBuilder } from "@nestjs/swagger";

export const SwaggerConfig = new DocumentBuilder()
  .setTitle("Nest JS standardization")
  .addBearerAuth(
    { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    "authorization"
  )
  .setDescription("The Nest JS standardization API documentation")
  .setVersion("1.0")
  .build();
