import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SEFEnrollment } from "./entities/sef-enrollment.entity";
import { EnrollmentAuditLog } from "./entities/enrollment-audit-log.entity";
import { StemcellApiLog } from "./entities/stemcell-api-log.entity";

@Injectable()
export class StemcellService {
  constructor(
    @InjectRepository(SEFEnrollment)
    private sefEnrollmentRepository: Repository<SEFEnrollment>,
    @InjectRepository(EnrollmentAuditLog)
    private enrollmentAuditLogRepository: Repository<EnrollmentAuditLog>,
    @InjectRepository(StemcellApiLog)
    private stemcellApiLogRepository: Repository<StemcellApiLog>
  ) {}
}
