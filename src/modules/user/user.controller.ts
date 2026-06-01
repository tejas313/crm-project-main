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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBearerAuth,
} from "@nestjs/swagger";
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
    description: "Defualt Authorization header",
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
      return this.responseService.success(res, "LOGIN_SUCCESS", result);
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  @Post("changePassword")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("authorization")
  @ApiOperation({ summary: "Change user password" })
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

      return this.responseService.success(res, result.message, result);
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  // Unified Add or Edit User (Manager or Agent)
  @Post("addOrEditUser")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("authorization")
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
  @Post("addOrUpdateRolePermissions")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("authorization")
  async addOrUpdateRolePermissions(
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
      console.log("error", error);
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  // Agent Leave Endpoints
  @Post("addLeave")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("authorization")
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

  @Get("getUserList")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("authorization")
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
        "USER_LIST_RETRIEVED_SUCCESS",
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

  @Get("getUserDetailsById")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("authorization")
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
        "USER_DETAILS_RETRIEVED_SUCCESS",
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

  @Get("getPermissionList")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("authorization")
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
        "PERMISSION_LIST_RETRIEVED_SUCCESS",
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

  @Get("getUserRolePermissions")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("authorization")
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
        "USER_ROLE_PERMISSIONS_RETRIEVED_SUCCESS",
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

  @Post("blockOrUnblockUser")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("authorization")
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
      const result = await this.userService.blockOrUnblockUser(
        dto,
        req.user.userId
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

  @Post("deleteUser")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("authorization")
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

  @Get("getLeaveList")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("authorization")
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
        "LEAVE_LIST_RETRIEVED_SUCCESS",
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
