import { Controller, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ReportService } from "./report.service";
import { AuthGuard } from "../../guard/auth.guard";
import { ResponseService } from "../../common/response.service";

@ApiTags("Reports")
@Controller("reports")
@UseGuards(AuthGuard)
@ApiBearerAuth("authorization")
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly responseService: ResponseService
  ) {}
}
