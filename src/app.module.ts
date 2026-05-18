import { Module, MiddlewareConsumer, Logger } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { databaseConfig } from "./config/database.config";
import { MulterModule } from "@nestjs/platform-express";
import { multerConfig } from "./config/multer.config";
import { ResponseService } from "./common/response.service";
import { ScheduledTaskService } from "./common/scheduledTask.service";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "./common/email.service";
import { DecryptHelper } from "./common/decryptHelper";
import { CommonService } from "./common/common.service";
import { EmailHtmlTemplete } from "./common/emailHtml.service";
import { APP_PIPE } from "@nestjs/core";
import { ValidationPipe } from "./common/validation.pipe";
import { LoggerMiddleware } from "./middlewares/logger.middleware";
import { UserModule } from "./modules/user/user.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  controllers: [],
  exports: [],
  providers: [
    ResponseService,
    ScheduledTaskService,
    JwtService,
    EmailService,
    DecryptHelper,
    CommonService,
    Logger,
    EmailHtmlTemplete,
    // DatabaseConnectionMiddleware,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    // ScheduleModule.forRoot(),
    // TypeOrmModule.forRootAsync({
    //   imports: [DatabaseModule],
    //   inject: [DatabaseService],
    //   useFactory: async () => getDatabaseConfig(),
    // }),
    MulterModule.register(multerConfig),
    UserModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(DatabaseConnectionMiddleware).forRoutes("*");
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
