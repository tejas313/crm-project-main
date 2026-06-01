import { Controller, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { DialerService } from "./dialer.service";
import { AuthGuard } from "../../guard/auth.guard";
import { ResponseService } from "../../common/response.service";

@ApiTags("Dialer")
@Controller("dialer")
@UseGuards(AuthGuard)
@ApiBearerAuth("authorization")
export class DialerController {
  constructor(
    private readonly dialerService: DialerService,
    private readonly responseService: ResponseService
  ) {}
}
