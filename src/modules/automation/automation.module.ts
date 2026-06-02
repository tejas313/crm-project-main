import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Automation } from "./entities/automation.entity";
import { AutomationExecutionLog } from "./entities/automation-execution-log.entity";
import { AutomationController } from "./automation.controller";
import { AutomationService } from "./automation.service";
import { ResponseService } from "../../common/response.service";

@Module({
  imports: [TypeOrmModule.forFeature([Automation, AutomationExecutionLog])],
  controllers: [AutomationController],
  providers: [AutomationService, ResponseService],
  exports: [AutomationService],
})
export class AutomationModule {}
