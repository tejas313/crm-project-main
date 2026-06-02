import { Controller, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { PresentationService } from "./presentation.service";
import { AuthGuard } from "../../guard/auth.guard";
import { ResponseService } from "../../common/response.service";

@ApiTags("Presentations")
@Controller("presentations")
@UseGuards(AuthGuard)
@ApiBearerAuth("authorization")
export class PresentationController {
  constructor(
    private readonly presentationService: PresentationService,
    private readonly responseService: ResponseService
  ) {}
}
