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
  AgentLeaveDto,
  LeaveListDto,
  AddRolePermissionsDto,
  AddOrEditUserDto,
  UserListFiltersDto,
  UserByIdDto,
} from "./user-management.dto";
import { ResponseService } from "../../common/response.service";
import { Request, Response } from "express";
import { NonAuthHeader } from "src/guard/nonAuth.guard";
import { AuthGuard } from "src/guard/auth.guard";
import { RoleType } from "./entities/role-details.entity";

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

  // Unified Add or Edit User (Manager or Agent)
  @Post("add-or-edit-user")
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({
    summary:
      "Add or Edit User - Unified endpoint for Manager and Agent (Admin only)",
  })
  async addOrEditUser(
    @Body() dto: AddOrEditUserDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      if (req.user.role !== RoleType.ADMIN) {
        return this.responseService.error(req, res, "FORBIDDEN_ACCESS", 403);
      }
      const result = await this.userService.addOrEditUser(dto);

      return this.responseService.success(res, result.message, result);
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  // Add or Update Role Permissions
  @Post("add-permissions")
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({ summary: "Add or Update Role Permissions (Admin only)" })
  async addPermissions(
    @Body() dto: AddRolePermissionsDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      if (req.user.role !== RoleType.ADMIN) {
        return this.responseService.error(req, res, "FORBIDDEN_ACCESS", 403);
      }
      const performedBy = req.user.userId;
      const result = await this.userService.addOrUpdateRolePermissions(
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
      const agentId = req.user.role_id;
      const result = await this.userService.addLeave(userId, agentId, dto);

      return this.responseService.success(res, result.message, result);
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  @Get("user-list")
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({
    summary: "Get User List with pagination, filters, and counts (Admin only)",
  })
  async getUserList(
    @Query() query: UserListFiltersDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      if (req.user.role !== RoleType.ADMIN) {
        return this.responseService.error(req, res, "FORBIDDEN_ACCESS", 403);
      }
      const result = await this.userService.getUserList(query);
      return this.responseService.success(
        res,
        "User list retrieved successfully",
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

  @Get("userDetailsbyId")
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({ summary: "Get User Details by ID (Admin only)" })
  async getUserDetailsById(
    @Query("id") id: string,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      if (req.user.role !== RoleType.ADMIN) {
        return this.responseService.error(req, res, "FORBIDDEN_ACCESS", 403);
      }
      const result = await this.userService.getUserDetailsById(Number(id));
      return this.responseService.success(
        res,
        "User details retrieved successfully",
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

  @Get("permissionList")
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({
    summary: "Get Hierarchical List of Permissions (Admin only)",
  })
  async getPermissionList(@Req() req: any, @Res() res: Response) {
    try {
      if (req.user.role !== RoleType.ADMIN) {
        return this.responseService.error(req, res, "FORBIDDEN_ACCESS", 403);
      }
      const result = await this.userService.getPermissionList();
      return this.responseService.success(
        res,
        "Permission list retrieved successfully",
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

  @Get("userRolePermissions")
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({ summary: "Get User Role Permissions (Admin only)" })
  async getUserRolePermissions(
    @Query("id") id: string,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      if (req.user.role !== RoleType.ADMIN) {
        return this.responseService.error(req, res, "FORBIDDEN_ACCESS", 403);
      }
      const result = await this.userService.getUserRolePermissions(Number(id));
      return this.responseService.success(
        res,
        "User role permissions retrieved successfully",
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

  @Post("block-unblock")
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({ summary: "Block or Unblock User (Admin only)" })
  async blockUnblockUser(
    @Body() dto: UserByIdDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      if (req.user.role !== RoleType.ADMIN) {
        return this.responseService.error(req, res, "FORBIDDEN_ACCESS", 403);
      }
      const result = await this.userService.blockUnblockUser(dto);
      return this.responseService.success(res, result.message, result);
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  @Post("delete")
  @UseGuards(AuthGuard)
  @ApiHeader({ name: "authorizations", required: true })
  @ApiOperation({ summary: "Delete User (Admin only)" })
  async deleteUser(
    @Body() dto: UserByIdDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      if (req.user.role !== RoleType.ADMIN) {
        return this.responseService.error(req, res, "FORBIDDEN_ACCESS", 403);
      }
      const deletedByUserId = req.user.userId;
      const result = await this.userService.deleteUser(dto, deletedByUserId);
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
      const roleId = req.user.role_id;
      const role = req.user.role;

      const result = await this.userService.getLeaveList(roleId, role, query);

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
