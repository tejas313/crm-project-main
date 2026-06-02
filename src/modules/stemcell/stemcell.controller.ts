import { Controller, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { StemcellService } from "./stemcell.service";
import { AuthGuard } from "../../guard/auth.guard";
import { ResponseService } from "../../common/response.service";

@ApiTags("Stemcell")
@Controller("stemcell")
@UseGuards(AuthGuard)
@ApiBearerAuth("authorization")
export class StemcellController {
  constructor(
    private readonly stemcellService: StemcellService,
    private readonly responseService: ResponseService
  ) {}
}
