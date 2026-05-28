import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { json, urlencoded } from "body-parser";
import { ValidationExceptionFilter } from "./common/validation-exception.filter";
import { Request, Response } from "express";
import * as express from "express";
import * as compression from "compression";

import {
  ExpressAdapter,
  NestExpressApplication,
} from "@nestjs/platform-express";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { SwaggerConfig } from "./config/swagger.config";
import { resolve } from "path";

async function bootstrap() {
  const server = express();
  server.use(compression());
  server.use(json({ limit: "100mb" }));
  server.use(urlencoded({ extended: true, limit: "100mb" }));
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server)
    // { logger: ["error", "warn"] }
  );
  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "*",
    credentials: true,
  });
  app.useStaticAssets(resolve("uploads"));
  app.useStaticAssets("uploads", { prefix: "/uploads" });
  app.useStaticAssets(resolve("public"));
  app.useStaticAssets("public", { prefix: "/public" });
  app.use(json({ limit: "150mb" }));

  // Enable WebSocket adapter for Socket.IO (Chat feature)
  app.useWebSocketAdapter(new IoAdapter(app));

  app.setGlobalPrefix("v1");

  const document = SwaggerModule.createDocument(app, SwaggerConfig);
  SwaggerModule.setup("api", app, document);

  // Enable ValidationPipe globally
  const validationOptions = {
    whitelist: true, // Automatically remove properties that are not decorated with validation decorators
  };
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalFilters(new ValidationExceptionFilter());
  server.get("/health", (req: Request, res: Response) => {
    res.send("success");
  });
  await app.listen(process.env.PORT);
}
bootstrap();
