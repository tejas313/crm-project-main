import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Appointment } from "./entities/appointment.entity";
import { GoogleCalendarIntegration } from "./entities/google-calendar-integration.entity";
import { AppointmentController } from "./appointment.controller";
import { AppointmentService } from "./appointment.service";
import { ResponseService } from "../../common/response.service";

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, GoogleCalendarIntegration])],
  controllers: [AppointmentController],
  providers: [AppointmentService, ResponseService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
