import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  Headers,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { LoginDto } from "./login.dto";
import { ChangePasswordDto } from "./change-password.dto";
import {
  ManagerDto,
  AgentDto,
  AgentLeaveDto,
  LeaveListDto,
  AddUserPermissionsDto,
} from "./user-management.dto";
import { ResponseService } from "../../common/response.service";
import { Request, Response } from "express";
import { NonAuthHeader } from "src/guard/nonAuth.guard";
import { AuthGuard } from "src/guard/auth.guard";
import { UserRole } from "./entities/user.entity";

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseService: ResponseService
  ) {}

  @Post("login")
  @UseGuards(NonAuthHeader)
  @ApiOperation({ summary: "User login" })
  @ApiHeader({
    name: "authorizations",
    description: "Authorization header",
    required: true,
  })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async login(
    @Body() loginDto: LoginDto,
    @Headers("authorizations") authorizations: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const result = await this.userService.login(loginDto);
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

  @Post("change-password")
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: "authorizations",
    description: "Authorization token",
    required: true,
  })
  @ApiOperation({ summary: "Change user password" })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  @ApiResponse({ status: 400, description: "Invalid old password" })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      const userId = req.user.userId;
      const result = await this.userService.changePassword(
        userId,
        changePasswordDto
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

  // Manager Management (Common Add or Edit)
  @Post("add-or-edit-manager")
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({ summary: "Add or Edit Manager (Admin only)" })
  async addOrEditManager(
    @Body() dto: ManagerDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      if (req.user.role !== UserRole.ADMIN) {
        return this.responseService.error(req, res, "FORBIDDEN_ACCESS", 403);
      }
      const result = await this.userService.addOrEditManager(dto);

      return this.responseService.success(res, result.message, result);
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  // Agent Management (Common Add or Edit)
  @Post("add-or-edit-agent")
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({ summary: "Add or Edit Agent (Admin only)" })
  async addOrEditAgent(
    @Body() dto: AgentDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      if (req.user.role !== UserRole.ADMIN) {
        return this.responseService.error(req, res, "FORBIDDEN_ACCESS", 403);
      }
      const result = await this.userService.addOrEditAgent(dto);

      return this.responseService.success(res, result.message, result);
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  // Add or Update User Permissions
  @Post("add-permissions")
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({ summary: "Add or Update User Permissions (Admin only)" })
  async addPermissions(
    @Body() dto: AddUserPermissionsDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      if (req.user.role !== UserRole.ADMIN) {
        return this.responseService.error(req, res, "FORBIDDEN_ACCESS", 403);
      }
      const performedBy = req.user.userId;
      const result = await this.userService.addOrUpdateUserPermissions(
        dto,
        performedBy
      );

      return this.responseService.success(res, result.message, result);
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  // Agent Leave Endpoints
  @Post("add-leave")
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({ summary: "Add Agent Leave" })
  async addLeave(
    @Body() dto: AgentLeaveDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      const userId = req.user.userId;
      const result = await this.userService.addLeave(userId, dto);

      return this.responseService.success(res, result.message, result);
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  @Get("leave-list")
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({ summary: "Get Leave List based on Role" })
  async getLeaveList(
    @Query() query: LeaveListDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      const userId = req.user.userId;
      const role = req.user.role;

      const result = await this.userService.getLeaveList(userId, role, query);

      return this.responseService.success(
        res,
        "Leave list retrieved successfully",
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
