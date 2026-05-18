import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { User } from "./entities/user.entity";
import { UserSession } from "./entities/user-session.entity";
import { Manager } from "./entities/manager.entity";
import { Agent } from "./entities/agent.entity";
import { ResponseService } from "../../common/response.service";
import { UserRolePermission } from "./entities/user-role-permission.entity";
import { AgentLeaveCalendar } from "./entities/agent-leave-calendar.entity";
import { DecryptHelper } from "../../common/decryptHelper";
import { EmailService } from "../../common/email.service";
import { CommonService } from "../../common/common.service";
import { EmailHtmlTemplete } from "../../common/emailHtml.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NonAuthHeader } from "src/guard/nonAuth.guard";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserSession,
      Manager,
      Agent,
      UserRolePermission,
      AgentLeaveCalendar,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET_KEY") || "secretKey",
        signOptions: {
          expiresIn: configService.get("JWT_EXPIRE_TIME") || "1d",
        },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    ResponseService,
    NonAuthHeader,
    CommonService,
    DecryptHelper,
    EmailService,
    EmailHtmlTemplete,
  ],
  exports: [UserService],
})
export class UserModule {}
