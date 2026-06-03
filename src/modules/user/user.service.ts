import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, In, Like } from "typeorm";
import { User } from "./entities/user.entity";
import { UserSession } from "./entities/user-session.entity";
import {
  AgentLeaveCalendar,
  LeaveType,
} from "./entities/agent-leave-calendar.entity";
import { RoleDetails, RoleType } from "./entities/role-details.entity";
import { Module } from "./entities/module.entity";
import { ModulePermission } from "./entities/module-permission.entity";
import { RolePermission } from "./entities/role-permission.entity";
import { LoginDto } from "./login.dto";
import { ChangePasswordDto } from "./change-password.dto";
import {
  AgentLeaveDto,
  AddOrEditUserDto,
  UserListFiltersDto,
  UserByIdDto,
} from "./user-management.dto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { CommonService } from "../../common/common.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    @InjectRepository(AgentLeaveCalendar)
    private agentLeaveCalendarRepository: Repository<AgentLeaveCalendar>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(RoleDetails)
    private roleDetailsRepository: Repository<RoleDetails>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(ModulePermission)
    private modulePermissionRepository: Repository<ModulePermission>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private commonService: CommonService
  ) {}

  // Add or update role permissions
  async addOrUpdateRolePermissions(dto: any, performedByUserId?: number) {
    try {
      const {
        role_details_id,
        role_name,
        role_type,
        module_permission_id,
        is_active,
      } = dto;

      // Basic validation
      if (!Array.isArray(module_permission_id)) {
        throw new BadRequestException("INVALID_PERMISSIONS_PAYLOAD");
      }

      let resolvedRoleId: number = role_details_id;
      let isNewRole = false;

      // If role_details_id not provided, create a new role first
      if (!resolvedRoleId) {
        if (!role_name || !role_type) {
          throw new BadRequestException(
            "ROLE_NAME_AND_ROLE_TYPE_REQUIRED_WHEN_ROLE_ID_NOT_PROVIDED"
          );
        }
        const existingRole = await this.roleDetailsRepository.findOne({
          where: { role_name: role_name, is_deleted: 0 },
        });
        if (existingRole) {
          throw new Error("ROLE_NAME_ALREADY_EXISTS");
        }
        const newRole = this.roleDetailsRepository.create({
          role_name,
          role_type: (role_type as RoleType) || RoleType.AGENT,
          is_active: is_active !== undefined ? is_active : 1,
          is_deleted: 0,
        });
        const savedRole = await this.roleDetailsRepository.save(newRole);
        resolvedRoleId = savedRole.id;
        isNewRole = true;
      } else {
        // Validate that the provided role exists
        const role = await this.roleDetailsRepository.findOne({
          where: { id: resolvedRoleId, is_deleted: 0 },
        });
        if (!role) throw new NotFoundException("ROLE_NOT_FOUND");

        if (role_name) {
          // Check if another role details already has this role_name
          const existingRole = await this.roleDetailsRepository.findOne({
            where: { role_name, id: Not(resolvedRoleId), is_deleted: 0 },
          });
          if (existingRole) {
            throw new Error("ROLE_NAME_ALREADY_EXISTS");
          }
          role.role_name = role_name;
        }

        if (role_type) {
          role.role_type = role_type as RoleType;
        }

        if (is_active !== undefined) {
          role.is_active = is_active;
        }

        role.modify_at = new Date();
        role.modify_by = performedByUserId || null;
        await this.roleDetailsRepository.save(role);
      }

      // Fetch all permissions rows for this role (including deleted ones)
      const existingRows = await this.rolePermissionRepository.find({
        where: { fk_role_details_id: resolvedRoleId },
      });

      const existingMap = new Map<number, any>();
      for (const row of existingRows)
        existingMap.set(row.fk_module_permission_id, row);

      // Normalize incoming permissions (unique numbers)
      const incomingPerms = Array.from(
        new Set(module_permission_id.map((p: any) => Number(p)))
      );

      // Validate that all module_permission_id exist in module_permission table and are allowed for this role type
      if (incomingPerms.length > 0) {
        const role = await this.roleDetailsRepository.findOne({
          where: { id: resolvedRoleId },
        });

        const permissionWhere: any = { id: In(incomingPerms), is_deleted: 0 };
        if (role.role_type === RoleType.ADMIN) {
          permissionWhere.is_admin_use = 1;
        } else if (role.role_type === RoleType.MANAGER) {
          permissionWhere.is_manager_use = 1;
        } else if (role.role_type === RoleType.AGENT) {
          permissionWhere.is_agent_use = 1;
        }

        const validPermissions = await this.modulePermissionRepository.find({
          where: permissionWhere,
        });

        if (validPermissions.length !== incomingPerms.length) {
          throw new BadRequestException(
            "ONE_OR_MORE_MODULE_PERMISSIONS_NOT_FOUND_OR_NOT_ALLOWED_FOR_THIS_ROLE_TYPE"
          );
        }
      }

      const incomingSet = new Set(incomingPerms);

      const toCreate: number[] = [];
      const toReactivate: any[] = [];
      const toDelete: any[] = [];

      // Determine creates and reactivations
      for (const perm of incomingPerms) {
        const existing = existingMap.get(perm);
        if (!existing) {
          toCreate.push(perm);
        } else if (existing.is_deleted && Number(existing.is_deleted) === 1) {
          existing.is_deleted = 0;
          existing.modify_at = new Date();
          existing.modify_by = performedByUserId || null;
          toReactivate.push(existing);
        }
      }

      // Determine deletions: any existing active row not present in incoming set
      for (const row of existingRows) {
        if (
          (!row.is_deleted || Number(row.is_deleted) === 0) &&
          !incomingSet.has(row.fk_module_permission_id)
        ) {
          row.is_deleted = 1;
          row.modify_at = new Date();
          row.modify_by = performedByUserId || null;
          toDelete.push(row);
        }
      }

      // Persist changes
      if (toCreate.length) {
        const created = toCreate.map((perm) =>
          this.rolePermissionRepository.create({
            fk_role_details_id: resolvedRoleId,
            fk_module_permission_id: perm,
            created_by: performedByUserId || null,
          })
        );
        await this.rolePermissionRepository.save(created);
      }

      if (toReactivate.length)
        await this.rolePermissionRepository.save(toReactivate);
      if (toDelete.length) await this.rolePermissionRepository.save(toDelete);

      return {
        success: true,
        message: isNewRole
          ? "ROLE_CREATED_SUCCESSFULLY"
          : "ROLE_UPDATED_SUCCESSFULLY",
        role_details_id: resolvedRoleId,
      };
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  private async checkEmailAvailability(
    email: string,
    currentUserId?: number
  ): Promise<void> {
    // Check only users table
    const query = currentUserId
      ? { email, id: Not(currentUserId), is_deleted: 0 }
      : { email, is_deleted: 0 };

    const existingUser = await this.userRepository.findOne({
      where: query,
    });
    console.log("existingUser",existingUser)
    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }
  }

  private async checkPhoneAvailability(
    phone: string,
    currentUserId?: number
  ): Promise<void> {
    // Check only users table
    const query = currentUserId
      ? { phone, id: Not(currentUserId), is_deleted: 0 }
      : { phone, is_deleted: 0 };

    const existingUser = await this.userRepository.findOne({
      where: query,
    });

    if (existingUser) {
      throw new Error("PHONE_ALREADY_EXISTS");
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // Find user by email
      const user = await this.userRepository.findOne({
        where: { email, is_deleted: 0 },
        relations: ["roleDetails"],
      });

      if (!user) {
        throw new UnauthorizedException("USER_NOT_FOUND");
      }

      if (user.is_active === 0) {
        throw new UnauthorizedException("USER_BLOCKED");
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException("INVALID_CREDENTIALS");
      }

      // Same payload for both tokens
      const payload = {
        userId: user.id,
        email: user.email,
        role: user.roleDetails?.role_type || null,
        role_id: user.fk_role_id,
      };

      // Main token
      const token = await this.jwtService.signAsync(payload);

      // Refresh token with different expiry
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get("REFRESH_EXPIRE_TIME") || "1d",
      });

      // Calculate expiry dates for database storage
      const getExpiryDate = (timeStr: string) => {
        const date = new Date();
        const value = parseInt(timeStr);
        if (timeStr.endsWith("h")) date.setHours(date.getHours() + value);
        else if (timeStr.endsWith("d")) date.setDate(date.getDate() + value);
        else if (timeStr.endsWith("m"))
          date.setMinutes(date.getMinutes() + value);
        else date.setHours(date.getHours() + 20); // default 20h
        return date;
      };

      const expiresAt = getExpiryDate(
        this.configService.get("JWT_EXPIRE_TIME") || "20h"
      );
      const refreshExpiresAt = getExpiryDate(
        this.configService.get("REFRESH_EXPIRE_TIME") || "24h"
      );

      // Store session in database
      const userSession = new UserSession();
      userSession.fk_user_id = user.id;
      userSession.token = token;
      userSession.expires_at = expiresAt;
      userSession.refresh_token = refreshToken;
      userSession.refresh_expires_at = refreshExpiresAt;

      await this.userSessionRepository.save(userSession);

      return {
        id: user.id,
        email: user.email,
        role: user.roleDetails?.role_type || null,
        role_id: user.fk_role_id,
        token,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    try {
      const { oldPassword, newPassword } = changePasswordDto;

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException("USER_NOT_FOUND");
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException("INVALID_OLD_PASSWORD");
      }

      const saltRounds = parseInt(
        this.configService.get("SALT_ROUND") || "10",
        10
      );
      const salt = await bcrypt.genSalt(saltRounds);
      user.password = await bcrypt.hash(newPassword, salt);
      user.password_changed_at = new Date();

      await this.userRepository.save(user);

      return { success: true, message: "PASSWORD_CHANGED_SUCCESS" };
    } catch (error) {
      throw error;
    }
  }

  // Unified Add or Edit User
  async addOrEditUser(dto: AddOrEditUserDto, performedByUserId?: number) {
    try {
      let user: User | null = null;
      if (dto.id) {
        // Edit mode
        user = await this.userRepository.findOne({
          where: { id: dto.id, is_deleted: 0 },
          relations: ["roleDetails"],
        });
        if (!user) throw new NotFoundException("USER_NOT_FOUND");
      }

      // Validate role_id if provided
      let roleDetails: RoleDetails | null = null;
      if (dto.role_id) {
        roleDetails = await this.roleDetailsRepository.findOne({
          where: { id: dto.role_id, is_deleted: 0 },
        });
        if (!roleDetails) {
          throw new NotFoundException("ROLE_NOT_FOUND");
        }
      }

      // Validate fk_manager_id if provided
      if (dto.fk_manager_id) {
        const manager = await this.userRepository.findOne({
          where: { id: dto.fk_manager_id, is_deleted: 0 },
          relations: ["roleDetails"],
        });
        if (!manager) {
          throw new NotFoundException("MANAGER_NOT_FOUND");
        }
        if (manager.roleDetails?.role_type !== RoleType.MANAGER) {
          throw new BadRequestException("SELECTED_USER_IS_NOT_A_MANAGER");
        }
      }

      // Check if manager is required for Agent role
      const effectiveRoleType = roleDetails
        ? roleDetails.role_type
        : user?.roleDetails?.role_type;
      if (effectiveRoleType === RoleType.AGENT && !dto.fk_manager_id) {
        throw new BadRequestException("MANAGER_ID_REQUIRED_FOR_AGENT_ROLE");
      }

      // Check email availability
      await this.checkEmailAvailability(dto.email, dto.id);

      // Check phone availability if provided
      if (dto.phone) {
        await this.checkPhoneAvailability(dto.phone, dto.id);
      }

      if (!user) {
        // Add mode
        user = new User();
        user.created_by = performedByUserId || null;
      }

      user.first_name = dto.first_name;
      user.last_name = dto.last_name;
      user.email = dto.email;
      user.phone = dto.phone || null;
      user.fk_manager_id = dto.fk_manager_id || null;
      if (roleDetails) {
        user.fk_role_id = roleDetails.id;
      }

      // Use password from DTO if provided
      if (dto.password) {
        const saltRounds = parseInt(
          this.configService.get("SALT_ROUND") || "10",
          10
        );
        const salt = await bcrypt.genSalt(saltRounds);
        user.password = await bcrypt.hash(dto.password, salt);
        user.password_changed_at = new Date();
      } else if (!dto.id) {
        // Add mode, generate password if not provided in DTO
        const saltRounds = parseInt(
          this.configService.get("SALT_ROUND") || "10",
          10
        );
        const salt = await bcrypt.genSalt(saltRounds);
        user.password = await bcrypt.hash(dto.password, salt);
      }

      if (dto.id) {
        user.modify_at = new Date();
        user.modify_by = performedByUserId || null;
      }

      await this.userRepository.save(user);

      return {
        success: true,
        message: dto.id ? "USER_UPDATED_SUCCESS" : "USER_CREATED_SUCCESS",
        data: user,
      };
    } catch (error) {
      throw error;
    }
  }

  // Agent Leave Management
  async addLeave(userId: number, agentId: any, dto: AgentLeaveDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, is_deleted: 0 },
        relations: ["roleDetails"],
      });
      if (!user || user.roleDetails?.role_type !== RoleType.AGENT) {
        throw new UnauthorizedException("ONLY_AGENTS_CAN_ADD_LEAVE");
      }

      const { leave_start_date, leave_end_date } = dto;

      const today = new Date().toISOString().split("T")[0];

      // Validation: start and end dates should be today or in the future
      if (leave_start_date < today || leave_end_date < today) {
        throw new BadRequestException("LEAVE_DATES_CANNOT_BE_IN_PAST");
      }

      // Basic validation: start should not be after end
      if (leave_start_date > leave_end_date) {
        throw new BadRequestException("INVALID_LEAVE_DATE_RANGE");
      }

      // If agent already has a leave that overlaps with this range, don't add
      const existing = await this.agentLeaveCalendarRepository
        .createQueryBuilder("lc")
        .where("lc.fk_agent_id = :agentId", { agentId: userId })
        .andWhere("lc.is_cancel = :isCancel", { isCancel: 0 })
        .andWhere("lc.is_deleted = :isDeleted", { isDeleted: 0 })
        .andWhere(
          "(lc.leave_start_date <= :leave_end_date AND lc.leave_end_date >= :leave_start_date)",
          { leave_start_date, leave_end_date }
        )
        .getRawOne();

      if (existing) {
        throw new BadRequestException("LEAVE_ALREADY_EXISTS_FOR_THIS_RANGE");
      }

      // Calculate difference in days (+1 to include both start and end days)
      const startDate = new Date(leave_start_date);
      const endDate = new Date(leave_end_date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const leaveCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const leave = this.agentLeaveCalendarRepository.create({
        fk_agent_id: userId,
        leave_start_date: leave_start_date,
        leave_end_date: leave_end_date,
        leave_count: leaveCount,
        leave_type: dto.leave_type as LeaveType,
        reason: dto.reason,
        is_cancel: 0,
      });

      const savedLeave = await this.agentLeaveCalendarRepository.save(leave);

      return {
        success: true,
        message: "LEAVE_ADDED_SUCCESSFULLY",
        data: savedLeave,
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserList(filters: UserListFiltersDto) {
    try {
      const {
        pageNumber = 1,
        pageLimit = 10,
        search,
        role,
        status,
        is_csv,
      } = filters;
      const page = Number(pageNumber);
      const limit = Number(pageLimit);
      const skip = (page - 1) * limit;

      const managerCount = await this.userRepository
        .createQueryBuilder("user")
        .leftJoin("user.roleDetails", "roleDetails")
        .where("roleDetails.role_type = :roleType", {
          roleType: RoleType.MANAGER,
        })
        .andWhere("user.is_deleted = 0")
        .getCount();

      const agentCount = await this.userRepository
        .createQueryBuilder("user")
        .leftJoin("user.roleDetails", "roleDetails")
        .where("roleDetails.role_type = :roleType", {
          roleType: RoleType.AGENT,
        })
        .andWhere("user.is_deleted = 0")
        .getCount();

      const blockCount = await this.userRepository
        .createQueryBuilder("user")
        .leftJoin("user.roleDetails", "roleDetails")
        .where("user.is_active = 0")
        .andWhere("user.is_deleted = 0")
        .andWhere("roleDetails.role_type != :adminType", {
          adminType: RoleType.ADMIN,
        })
        .getCount();

      let query = this.userRepository
        .createQueryBuilder("users")
        .leftJoin("users.roleDetails", "roleDetails")
        .select([
          "users.id as id",
          "CONCAT_WS(' ', users.first_name, users.last_name) as name",
          "users.first_name AS first_name",
          "users.last_name as last_name",
          "users.email as email",
          "users.phone as phone",
          "roleDetails.role_type as role",
          "roleDetails.role_name as role_name",
          "users.is_active as is_active",
          `COALESCE(
  (
    SELECT CONCAT_WS(' ', mu.first_name, mu.last_name)
    FROM users mu
    WHERE mu.id = users.id
  ),
  '-'
) AS manager`,
          "DATE_FORMAT(users.created_at, '%d/%m/%Y') AS created_at",
          "DATE_FORMAT(users.modify_at, '%d/%m/%Y') AS modify_at",
          "users.updated_at as updated_at",
        ])
        .where("users.is_deleted = 0")
        .andWhere("roleDetails.role_type IN (:...roles)", {
          roles: [RoleType.MANAGER, RoleType.AGENT],
        });

      if (search) {
        query = query.andWhere(
          "(users.first_name LIKE :search OR users.last_name LIKE :search OR users.email LIKE :search OR users.phone LIKE :search)",
          { search: `%${search}%` }
        );
      }

      if (role) {
        query = query.andWhere("roleDetails.role_type = :role", { role });
      }

      if (status) {
        query = query.andWhere(`users.is_active = ${status}`);
      }

      query = query.orderBy("users.created_at", "DESC");

      if (is_csv == 1) {
        const rawData = await query.getRawMany();
        return {
          success: true,
          data: { csvdata: rawData },
        };
      } else {
        const [rawData, count] = await Promise.all([
          query.limit(limit).offset(skip).getRawMany(),
          query.getCount(),
        ]);

        const totalPages = Math.ceil(count / limit);

        return {
          success: true,
          data: rawData,
          total_count: count,
          current_page: page,
          total_pages: totalPages,
          per_page: limit,
          managerCount,
          agentCount,
          blockCount,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async blockOrUnblockUser(dto: UserByIdDto, performedByUserId?: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: dto.id, is_deleted: 0 },
      });
      if (!user) {
        throw new NotFoundException("USER_NOT_FOUND");
      }

      user.is_active = user.is_active === 1 ? 0 : 1; // Auto-toggle!
      user.modify_at = new Date();
      user.modify_by = performedByUserId || null;
      await this.userRepository.save(user);

      return {
        success: true,
        message:
          user.is_active === 0
            ? "USER_BLOCKED_SUCCESS"
            : "USER_UNBLOCKED_SUCCESS",
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(dto: UserByIdDto, deletedByUserId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: dto.id, is_deleted: 0 },
      });
      if (!user) {
        throw new NotFoundException("USER_NOT_FOUND");
      }

      user.is_deleted = 1;
      user.modify_at = new Date();
      user.modify_by = deletedByUserId || null;
      await this.userRepository.save(user);

      return {
        success: true,
        message: "USER_DELETED_SUCCESS",
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserDetailsById(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id, is_deleted: 0 },
        relations: ["roleDetails"],
      });
      if (!user) {
        throw new NotFoundException("USER_NOT_FOUND");
      }

      return {
        success: true,
        data: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.roleDetails?.role_type || null,
          role_id: user.fk_role_id,
          is_active: user.is_active,
          fk_manager_id: user.fk_manager_id,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserCreationDropdown() {
    try {
      // 1. Fetch active, non-deleted roles
      const roles = await this.roleDetailsRepository.find({
        where: { is_active: 1, is_deleted: 0, role_type: Not(RoleType.ADMIN) },
        select: ["id", "role_name", "role_type"],
      });

      // 2. Fetch users with role_type MANAGER
      const managers = await this.userRepository
        .createQueryBuilder("user")
        .leftJoin("user.roleDetails", "roleDetails")
        .where("roleDetails.role_type = :roleType", {
          roleType: RoleType.MANAGER,
        })
        .andWhere("user.is_active = 1")
        .andWhere("user.is_deleted = 0")
        .select([
          "user.id as id",
          "CONCAT_WS(' ', user.first_name, user.last_name) as name",
        ])
        .getRawMany();

      return {
        roles,
        managers,
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserRolePermissions(roleId: number) {
    try {
      const role = await this.roleDetailsRepository.findOne({
        where: { id: roleId, is_deleted: 0 },
      });
      if (!role) {
        throw new NotFoundException("ROLE_NOT_FOUND");
      }

      const moduleWhere: any = { is_deleted: 0 };
      const permissionWhere: any = { is_deleted: 0 };

      if (role.role_type === RoleType.ADMIN) {
        moduleWhere.is_admin_use = 1;
        permissionWhere.is_admin_use = 1;
      } else if (role.role_type === RoleType.MANAGER) {
        moduleWhere.is_manager_use = 1;
        permissionWhere.is_manager_use = 1;
      } else if (role.role_type === RoleType.AGENT) {
        moduleWhere.is_agent_use = 1;
        permissionWhere.is_agent_use = 1;
      }

      const [modules, modulePermissions, rolePermissions] = await Promise.all([
        this.moduleRepository.find({
          where: moduleWhere,
          order: { id: "ASC" },
        }),
        this.modulePermissionRepository.find({
          where: permissionWhere,
          order: { id: "ASC" },
        }),
        roleId
          ? this.rolePermissionRepository.find({
              where: { fk_role_details_id: roleId, is_deleted: 0 },
            })
          : Promise.resolve([]),
      ]);

      const assignedPermissionIds = new Set(
        rolePermissions.map((rp) => rp.fk_module_permission_id)
      );

      const result = modules.map((module) => {
        const permissions = modulePermissions
          .filter((mp) => mp.fk_module_id === module.id)
          .map((mp) => ({
            id: mp.id,
            name: mp.name,
            is_admin_use: mp.is_admin_use,
            is_manager_use: mp.is_manager_use,
            is_agent_use: mp.is_agent_use,
            is_active: assignedPermissionIds.has(mp.id) ? 1 : 0,
          }));

        const isModuleActive = permissions.some((p) => p.is_active === 1)
          ? 1
          : 0;

        return {
          module_name: module.name,
          is_admin_use: module.is_admin_use,
          is_manager_use: module.is_manager_use,
          is_agent_use: module.is_agent_use,
          is_active: isModuleActive,
          role_permission: permissions,
        };
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPermissionList(roleType?: string) {
    try {
      const moduleWhere: any = { is_deleted: 0 };
      const permissionWhere: any = { is_deleted: 0 };

      if (roleType === RoleType.ADMIN) {
        moduleWhere.is_admin_use = 1;
        permissionWhere.is_admin_use = 1;
      } else if (roleType === RoleType.MANAGER) {
        moduleWhere.is_manager_use = 1;
        permissionWhere.is_manager_use = 1;
      } else if (roleType === RoleType.AGENT) {
        moduleWhere.is_agent_use = 1;
        permissionWhere.is_agent_use = 1;
      }

      // Get Module/ModulePermission data
      const modules = await this.moduleRepository.find({
        where: moduleWhere,
        order: { id: "ASC" },
      });

      const modulePermissions = await this.modulePermissionRepository.find({
        where: permissionWhere,
        order: { id: "ASC" },
      });

      // Construct module permission tree structure
      const moduleList = modules.map((module) => {
        const permissions = modulePermissions
          .filter((mp) => mp.fk_module_id === module.id)
          .map((mp) => ({
            id: mp.id,
            name: mp.name,
            is_admin_use: mp.is_admin_use,
            is_manager_use: mp.is_manager_use,
            is_agent_use: mp.is_agent_use,
          }));

        return {
          id: module.id,
          name: module.name,
          is_admin_use: module.is_admin_use,
          is_manager_use: module.is_manager_use,
          is_agent_use: module.is_agent_use,
          module_permissions: permissions,
        };
      });

      return {
        success: true,
        data: moduleList,
      };
    } catch (error) {
      throw error;
    }
  }

  async getRoleDetailsList(filters: any) {
    try {
      const {
        pageNumber = 1,
        pageLimit = 10,
        search,
        is_active,
        is_csv,
      } = filters;
      const page = Number(pageNumber);
      const limit = Number(pageLimit);
      const skip = (page - 1) * limit;

      let query = this.roleDetailsRepository
        .createQueryBuilder("rd")
        .leftJoin(
          "role_permission",
          "rp",
          "rp.fk_role_details_id = rd.id AND rp.is_deleted = 0"
        )
        .leftJoin(
          "module_permission",
          "mp",
          "mp.id = rp.fk_module_permission_id AND mp.is_deleted = 0"
        )
        .select([
          "rd.id as id",
          "rd.role_name as role_name",
          "GROUP_CONCAT(DISTINCT mp.name ORDER BY rp.fk_module_permission_id ASC SEPARATOR ', ') as permissions",
          "rd.is_active as is_active",
          "DATE_FORMAT(rd.created_at, '%d/%m/%Y') as created_at",
        ])
        .where("rd.is_deleted = 0")
        .groupBy("rd.id");

      if (search) {
        query = query.andWhere("rd.role_name LIKE :search", {
          search: `%${search}%`,
        });
      }

      if (is_active !== undefined) {
        query = query.andWhere("rd.is_active = :is_active", { is_active });
      }

      query = query.orderBy("rd.id", "ASC");

      if (is_csv == 1) {
        const rawData = await query.getRawMany();
        return {
          success: true,
          data: { csvdata: rawData },
        };
      }
      const [rawData, count] = await Promise.all([
        query.limit(limit).offset(skip).getRawMany(),
        this.roleDetailsRepository.count({
          where: {
            is_deleted: 0,
            ...(search && { role_name: Like(`%${search}%`) }),
            ...(is_active !== undefined && { is_active }),
          },
        }),
      ]);

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        data: rawData,
        total_count: count,
        current_page: page,
        total_pages: totalPages,
        per_page: limit,
      };
    } catch (error) {
      throw error;
    }
  }

  async getLeaveList(userId: number, role: string, filters: any) {
    try {
      const { pageNumber = 1, pageLimit = 10, search, is_csv } = filters;
      const page = Number(pageNumber);
      const limit = Number(pageLimit);
      const skip = (page - 1) * limit;

      let query = this.agentLeaveCalendarRepository
        .createQueryBuilder("agent_leave_calendar")
        .leftJoin(User, "users", "users.id = agent_leave_calendar.fk_agent_id")
        .select([
          "agent_leave_calendar.id as leave_id",
          "DATE_FORMAT(agent_leave_calendar.leave_start_date, '%Y-%m-%d') as leave_start_date",
          "DATE_FORMAT(agent_leave_calendar.leave_end_date, '%Y-%m-%d') as leave_end_date",
          "agent_leave_calendar.leave_count as leave_count",
          "agent_leave_calendar.leave_type as leave_type",
          "agent_leave_calendar.reason as reason",
          "agent_leave_calendar.is_cancel as is_cancel",
          "agent_leave_calendar.created_at as created_at",
          "users.email as agent_email",
          "CONCAT_WS(' ', users.first_name, users.last_name) as agent_name",
        ]);

      if (role === RoleType.AGENT) {
        query = query.where("agent_leave_calendar.fk_agent_id = :userId", {
          userId,
        });
      } else if (role === RoleType.MANAGER) {
        query = query.where("users.fk_manager_id = :managerId", {
          managerId: userId,
        });
      }

      if (search) {
        query = query.andWhere(
          "(users.first_name LIKE :search OR users.last_name LIKE :search OR users.email LIKE :search)",
          { search: `%${search}%` }
        );
      }

      query = query.orderBy("agent_leave_calendar.leave_start_date", "DESC");

      if (is_csv == 1) {
        const csvdata = await query.getRawMany();
        return {
          success: true,
          data: { csvdata },
        };
      } else {
        const [data, count] = await Promise.all([
          query.limit(limit).offset(skip).getRawMany(),
          query.getCount(),
        ]);

        const totalPages = Math.ceil(count / limit);

        return {
          data,
          total_count: count,
          current_page: page,
          total_pages: totalPages,
          per_page: limit,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async refresh_token(userId: any, sessionId: any) {
    // const queryRunner = this.dataSource.createQueryRunner();
    //await queryRunner.connect();
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, is_deleted: 0 },
        relations: ["roleDetails"],
      });
      if (!user) {
        throw new NotFoundException("USER_NOT_FOUND");
      }
      const payload = {
        userId: user.id,
        email: user.email,
        role: user.roleDetails?.role_type || null,
        role_id: user.fk_role_id,
      };

      // Main token
      const token = await this.jwtService.signAsync(payload);

      const getExpiryDate = (timeStr: string) => {
        const date = new Date();
        const value = parseInt(timeStr);
        if (timeStr.endsWith("h")) date.setHours(date.getHours() + value);
        else if (timeStr.endsWith("d")) date.setDate(date.getDate() + value);
        else if (timeStr.endsWith("m"))
          date.setMinutes(date.getMinutes() + value);
        else date.setHours(date.getHours() + 20); // default 20h
        return date;
      };

      const expiresAt = getExpiryDate(
        this.configService.get("JWT_EXPIRE_TIME") || "20h"
      );

      await this.userSessionRepository.update(
        { id: sessionId },
        { token: token, expires_at: expiresAt }
      );

      return { auth_token: token };
    } catch (error) {
      // await queryRunner.release();
      throw error;
    }
  }
}
