import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LeadActivity } from "./entities/lead-activity.entity";
import { AuditLog } from "./entities/audit-log.entity";
import { IntegrationLog } from "./entities/integration-log.entity";

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(LeadActivity)
    private leadActivityRepository: Repository<LeadActivity>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(IntegrationLog)
    private integrationLogRepository: Repository<IntegrationLog>
  ) {}
}
