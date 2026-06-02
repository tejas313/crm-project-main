import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SEFEnrollment } from "./entities/sef-enrollment.entity";
import { EnrollmentAuditLog } from "./entities/enrollment-audit-log.entity";
import { StemcellApiLog } from "./entities/stemcell-api-log.entity";
import { StemcellController } from "./stemcell.controller";
import { StemcellService } from "./stemcell.service";
import { ResponseService } from "../../common/response.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SEFEnrollment,
      EnrollmentAuditLog,
      StemcellApiLog,
    ]),
  ],
  controllers: [StemcellController],
  providers: [StemcellService, ResponseService],
  exports: [StemcellService],
})
export class StemcellModule {}
