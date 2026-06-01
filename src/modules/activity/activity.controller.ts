import { Controller, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ActivityService } from "./activity.service";
import { AuthGuard } from "../../guard/auth.guard";
import { ResponseService } from "../../common/response.service";

@ApiTags("Activities")
@Controller("activities")
@UseGuards(AuthGuard)
@ApiBearerAuth("authorization")
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly responseService: ResponseService
  ) {}
}
