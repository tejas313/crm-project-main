import { Controller, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AutomationService } from "./automation.service";
import { AuthGuard } from "../../guard/auth.guard";
import { ResponseService } from "../../common/response.service";

@ApiTags("Automation")
@Controller("automation")
@UseGuards(AuthGuard)
@ApiBearerAuth("authorization")
export class AutomationController {
  constructor(
    private readonly automationService: AutomationService,
    private readonly responseService: ResponseService
  ) {}
}
