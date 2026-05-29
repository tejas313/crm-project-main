import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { Task } from "./entities/task.entity";
import { Lead } from "../lead/entities/lead.entity";
import { User } from "../user/entities/user.entity";
import { LeadActivity } from "../activity/entities/lead-activity.entity";
import { UserSession } from "../user/entities/user-session.entity";
import { JwtService } from "@nestjs/jwt";
import { ResponseService } from "../../common/response.service";
import { ActivityModule } from "../activity/activity.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Lead, User, LeadActivity, UserSession]),
    ActivityModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, JwtService, ResponseService],
  exports: [TaskService],
})
export class TaskModule {}
