import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  Res,
  Get,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";
import { LeadService } from "./lead.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { LeadListFiltersDto } from "./dto/lead-list-filters.dto";
import { AuthGuard } from "../../guard/auth.guard";
import { ResponseService } from "src/common/response.service";

@ApiTags("Leads")
@Controller("leads")
@UseGuards(AuthGuard)
export class LeadController {
  constructor(
    private readonly leadService: LeadService,
    private readonly responseService: ResponseService
  ) {}

  @Post("manual-create")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({
    summary: "Create manual lead by agent",
    description:
      "Allows agents to manually create leads with mandatory fields like Name, Phone Number, Medium, and Lead Source. Includes duplicate check and pregnancy EDD validation.",
  })
  @ApiResponse({
    status: 201,
    description: "Lead created successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - validation failed or duplicate lead exists",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async createManualLead(
    @Body() createLeadDto: CreateLeadDto,
    @Request() req,
    @Res() res: Response
  ) {
    try {
      const userId = req.user.userId; // Get user ID from JWT token
      const result = await this.leadService.createManualLead(
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

  @Get("list")
  @ApiOperation({
    summary: "Get lead list with filters, pagination, and CSV export",
    description:
      "Retrieve leads with comprehensive filtering options including status, source, medium, owner, date ranges, EDD ranges, location filters, and more. Supports pagination and CSV export.",
  })
  @ApiResponse({
    status: 200,
    description: "Lead list retrieved successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  @UseGuards(AuthGuard)
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
