import { Controller, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AppointmentService } from "./appointment.service";
import { AuthGuard } from "../../guard/auth.guard";
import { ResponseService } from "../../common/response.service";

@ApiTags("Appointments")
@Controller("appointments")
@UseGuards(AuthGuard)
@ApiBearerAuth("authorization")
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly responseService: ResponseService
  ) {}
}
