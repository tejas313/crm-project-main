import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
  Get,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { LeadService } from "./lead.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { LeadListFiltersDto } from "./dto/lead-list-filters.dto";
import { AuthGuard } from "../../guard/auth.guard";
import { ResponseService } from "src/common/response.service";

@ApiTags("Leads")
@Controller("leads")
@UseGuards(AuthGuard)
@ApiBearerAuth("authorization")
export class LeadController {
  constructor(
    private readonly leadService: LeadService,
    private readonly responseService: ResponseService
  ) {}

  @Post("addOrEditLead")
  async addOrEditLead(
    @Body() createLeadDto: CreateLeadDto,
    @Request() req,
    @Res() res: Response
  ) {
    try {
      const userId = req.user.userId; // Get user ID from JWT token
      const result = await this.leadService.addOrEditLead(
        createLeadDto,
        userId
      );
      return this.responseService.success(
        res,
        result.message || "SUCCESS",
        result
      );
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  @Get("getLeadList")
  async getLeadList(
    @Query() filters: LeadListFiltersDto,
    @Request() req,
    @Res() res: Response
  ) {
    try {
      const userId = req.user.userId;
      const role = req.user.role;

      const result = await this.leadService.getLeadList(userId, role, filters);
      return this.responseService.success(
        res,
        "LEAD_LIST_RETRIEVED_SUCCESS",
        result
      );
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }
}
