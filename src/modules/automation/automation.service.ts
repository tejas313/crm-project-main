import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Automation } from "./entities/automation.entity";
import { AutomationExecutionLog } from "./entities/automation-execution-log.entity";

@Injectable()
export class AutomationService {
  constructor(
    @InjectRepository(Automation)
    private automationRepository: Repository<Automation>,
    @InjectRepository(AutomationExecutionLog)
    private automationExecutionLogRepository: Repository<AutomationExecutionLog>
  ) {}
}
