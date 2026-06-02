import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Report } from "./entities/report.entity";
import { ReportController } from "./report.controller";
import { ReportService } from "./report.service";
import { ResponseService } from "../../common/response.service";

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  controllers: [ReportController],
  providers: [ReportService, ResponseService],
  exports: [ReportService],
})
export class ReportModule {}
