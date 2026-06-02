import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DialerCalls } from "./entities/dialer-calls.entity";
import { DialerQueue } from "./entities/dialer-queue.entity";
import { WorkingHoursConfig } from "./entities/working-hours-config.entity";
import { DialerController } from "./dialer.controller";
import { DialerService } from "./dialer.service";
import { ResponseService } from "../../common/response.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([DialerCalls, DialerQueue, WorkingHoursConfig]),
  ],
  controllers: [DialerController],
  providers: [DialerService, ResponseService],
  exports: [DialerService],
})
export class DialerModule {}
