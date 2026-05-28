import { Module as NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { User } from "./entities/user.entity";
import { UserSession } from "./entities/user-session.entity";
import { Manager } from "./entities/manager.entity";
import { Agent } from "./entities/agent.entity";
import { ResponseService } from "../../common/response.service";
import { AgentLeaveCalendar } from "./entities/agent-leave-calendar.entity";
import { RoleDetails } from "./entities/role-details.entity";
import { Module } from "./entities/module.entity";
import { ModulePermission } from "./entities/module-permission.entity";
import { RolePermission } from "./entities/role-permission.entity";
import { DecryptHelper } from "../../common/decryptHelper";
import { EmailService } from "../../common/email.service";
import { CommonService } from "../../common/common.service";
import { EmailHtmlTemplete } from "../../common/emailHtml.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NonAuthHeader } from "src/guard/nonAuth.guard";

@NestModule({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserSession,
      Manager,
      Agent,
      AgentLeaveCalendar,
      RoleDetails,
      Module,
      ModulePermission,
      RolePermission,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET_KEY"),
        signOptions: {
          expiresIn: configService.get("JWT_EXPIRE_TIME"),
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
