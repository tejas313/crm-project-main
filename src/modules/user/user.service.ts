import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { User, UserRole } from "./entities/user.entity";
import { UserSession } from "./entities/user-session.entity";
import { Manager } from "./entities/manager.entity";
import { Agent } from "./entities/agent.entity";
import { AgentLeaveCalendar } from "./entities/agent-leave-calendar.entity";
import { LoginDto } from "./login.dto";
import { ChangePasswordDto } from "./change-password.dto";
import { ManagerDto, AgentDto, AgentLeaveDto } from "./user-management.dto";
import { UserRolePermission } from "./entities/user-role-permission.entity";
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
    @InjectRepository(UserRolePermission)
    private userRolePermissionRepository: Repository<UserRolePermission>,
    @InjectRepository(Manager)
    private managerRepository: Repository<Manager>,
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(AgentLeaveCalendar)
    private agentLeaveCalendarRepository: Repository<AgentLeaveCalendar>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private commonService: CommonService
  ) {}

  // Add or update user permissions
  async addOrUpdateUserPermissions(dto: any, performedByUserId?: number) {
    try {
      const { fk_user_id, permissions } = dto;

      // Basic validation
      if (!Array.isArray(permissions)) {
        return { success: false, message: "INVALID_PERMISSIONS_PAYLOAD" };
      }

      // Validate user exists
      const user = await this.userRepository.findOne({
        where: { id: fk_user_id, is_deleted: 0 },
      });
      if (!user) return { success: false, message: "USER_NOT_FOUND" };

      // Fetch all permissions rows for this user (including deleted ones)
      const existingRows = await this.userRolePermissionRepository.find({
        where: { fk_user_id },
      });

      const existingMap = new Map<number, any>();
      for (const row of existingRows)
        existingMap.set(row.fk_child_permission_id, row);

      // Normalize incoming permissions (unique numbers)
      const incomingPerms = Array.from(
        new Set(permissions.map((p: any) => Number(p)))
      );
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
          existing.deleted_at = null;
          existing.fk_deleted_by = null;
          toReactivate.push(existing);
        }
      }

      // Determine deletions: any existing active row not present in incoming set
      for (const row of existingRows) {
        if (
          (!row.is_deleted || Number(row.is_deleted) === 0) &&
          !incomingSet.has(row.fk_child_permission_id)
        ) {
          row.is_deleted = 1;
          row.deleted_at = new Date();
          row.fk_deleted_by = performedByUserId || null;
          toDelete.push(row);
        }
      }

      // Persist changes
      if (toCreate.length) {
        const created = toCreate.map((perm) =>
          this.userRolePermissionRepository.create({
            fk_user_id,
            fk_child_permission_id: perm,
          })
        );
        await this.userRolePermissionRepository.save(created);
      }

      if (toReactivate.length)
        await this.userRolePermissionRepository.save(toReactivate);
      if (toDelete.length)
        await this.userRolePermissionRepository.save(toDelete);

      return { success: true, message: "PERMISSIONS_UPDATED" };
    } catch (error) {
      throw error;
    }
  }

  private async checkEmailAvailability(
    email: string,
    currentUserId?: number,
    entityType?: "manager" | "agent"
  ): Promise<{ success: boolean; message?: string }> {
    // Check users table
    const existingUser = await this.userRepository.findOne({
      where: { email, is_deleted: 0 },
    });
    if (existingUser)
      return { success: false, message: "EMAIL_ALREADY_EXISTS" };

    // Check managers table
    const managerQuery =
      currentUserId && entityType === "manager"
        ? { email, id: Not(currentUserId), is_deleted: 0 }
        : { email, is_deleted: 0 };
    const existingManager = await this.managerRepository.findOne({
      where: managerQuery,
    });
    if (existingManager)
      return { success: false, message: "EMAIL_ALREADY_EXISTS" };

    // Check agents table
    const agentQuery =
      currentUserId && entityType === "agent"
        ? { email, id: Not(currentUserId), is_deleted: 0 }
        : { email, is_deleted: 0 };
    const existingAgent = await this.agentRepository.findOne({
      where: agentQuery,
    });
    if (existingAgent)
      return { success: false, message: "EMAIL_ALREADY_EXISTS" };

    return { success: true };
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // Find user by email
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        return { success: false, message: "USER_NOT_FOUND" };
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return { success: false, message: "INVALID_CREDENTIALS" };
      }

      // Same payload for both tokens
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        role_id: user.role_id,
      };

      // Main token
      const token = await this.jwtService.signAsync(payload);

      // Refresh token with different expiry
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get("REFRESH_EXPIRE_TIME") || "7d",
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
        role: user.role,
        role_id: user.role_id,
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
        return { success: false, message: "USER_NOT_FOUND" };
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return { success: false, message: "INVALID_OLD_PASSWORD" };
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

  // Common Add or Edit Manager
  async addOrEditManager(dto: ManagerDto) {
    try {
      // Find existing manager if editing
      let currentManager: Manager | null = null;
      if (dto.id) {
        currentManager = await this.managerRepository.findOne({
          where: { id: dto.id },
        });
        if (!currentManager)
          return { success: false, message: "USER_NOT_FOUND" };
      }

      // Check email across users, agents, and managers tables
      if (!currentManager || dto.email !== currentManager.email) {
        const emailCheck = await this.checkEmailAvailability(
          dto.email,
          dto.id,
          "manager"
        );
        if (!emailCheck.success) return emailCheck;
      }

      let savedManager: Manager;
      if (dto.id) {
        // Edit mode
        const manager = await this.managerRepository.findOne({
          where: { id: dto.id },
        });
        const oldEmail = manager.email;
        Object.assign(manager, dto);
        savedManager = await this.managerRepository.save(manager);

        // Update base user email if changed
        if (dto.email !== oldEmail) {
          const user = await this.userRepository.findOne({
            where: { email: oldEmail, role: UserRole.MANAGER, role_id: dto.id },
          });
          if (user) {
            user.email = dto.email;
            await this.userRepository.save(user);
          }
        }
      } else {
        // Add mode
        const manager = this.managerRepository.create(dto);
        savedManager = await this.managerRepository.save(manager);

        const user = new User();
        user.email = dto.email;
        const saltRounds = parseInt(
          this.configService.get("SALT_ROUND") || "10",
          10
        );
        const salt = await bcrypt.genSalt(saltRounds);
        const generatedPassword = this.commonService.generateSecurePassword();
        user.password = await bcrypt.hash(generatedPassword, salt);
        user.role = UserRole.MANAGER;
        user.role_id = savedManager.id;
        await this.userRepository.save(user);
      }

      return {
        success: true,
        message: dto.id ? "USER_UPDATED_SUCCESS" : "USER_CREATED_SUCCESS",
        data: savedManager,
      };
    } catch (error) {
      throw error;
    }
  }

  // Common Add or Edit Agent
  async addOrEditAgent(dto: AgentDto) {
    try {
      // Check if manager exists
      const manager = await this.managerRepository.findOne({
        where: { id: dto.fk_manager_id, is_deleted: 0 },
      });
      if (!manager) return { success: false, message: "MANAGER_NOT_FOUND" };

      // Find existing agent if editing
      let currentAgent: Agent | null = null;
      if (dto.id) {
        currentAgent = await this.agentRepository.findOne({
          where: { id: dto.id },
        });
        if (!currentAgent) return { success: false, message: "USER_NOT_FOUND" };
      }

      // Check email across users, managers, and agents tables
      if (!currentAgent || dto.email !== currentAgent.email) {
        const emailCheck = await this.checkEmailAvailability(
          dto.email,
          dto.id,
          "agent"
        );
        if (!emailCheck.success) return emailCheck;
      }

      let savedAgent: Agent;
      if (dto.id) {
        // Edit mode
        const agent = await this.agentRepository.findOne({
          where: { id: dto.id },
        });
        const oldEmail = agent.email;
        Object.assign(agent, dto);
        savedAgent = await this.agentRepository.save(agent);

        if (dto.email !== oldEmail) {
          const user = await this.userRepository.findOne({
            where: { email: oldEmail, role: UserRole.AGENT, role_id: dto.id },
          });
          if (user) {
            user.email = dto.email;
            await this.userRepository.save(user);
          }
        }
      } else {
        // Add mode
        const agent = this.agentRepository.create(dto);
        savedAgent = await this.agentRepository.save(agent);

        const user = new User();
        user.email = dto.email;
        const saltRounds = parseInt(
          this.configService.get("SALT_ROUND") || "10",
          10
        );
        const salt = await bcrypt.genSalt(saltRounds);
        const generatedPassword = this.commonService.generateSecurePassword();
        user.password = await bcrypt.hash(generatedPassword, salt);
        user.role = UserRole.AGENT;
        user.role_id = savedAgent.id;
        await this.userRepository.save(user);
      }

      return {
        success: true,
        message: dto.id ? "USER_UPDATED_SUCCESS" : "USER_CREATED_SUCCESS",
        data: savedAgent,
      };
    } catch (error) {
      throw error;
    }
  }

  // Agent Leave Management
  async addLeave(userId: number, dto: AgentLeaveDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, is_deleted: 0 },
      });
      if (!user || user.role !== UserRole.AGENT) {
        return { success: false, message: "ONLY_AGENTS_CAN_ADD_LEAVE" };
      }

      const startDate = new Date(dto.leave_start_date);
      const endDate = new Date(dto.leave_end_date);

      // Basic validation: start should not be after end
      if (startDate > endDate) {
        return { success: false, message: "INVALID_LEAVE_DATE_RANGE" };
      }

      // Normalize dates to YYYY-MM-DD (avoid timezone issues and compare only date portion)
      const formatDateOnly = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      const startDateStr = formatDateOnly(startDate);
      const endDateStr = formatDateOnly(endDate);

      // If agent already has a leave with the same start date OR same end date (and not cancelled), don't add
      const existing = await this.agentLeaveCalendarRepository
        .createQueryBuilder("lc")
        .select("lc.id", "id")
        .where("lc.fk_agent_id = :agentId", { agentId: user.id })
        .andWhere(
          "(lc.leave_start_date = :startDate OR lc.leave_end_date = :endDate)",
          { startDate: startDateStr, endDate: endDateStr }
        )
        .andWhere("lc.is_cancel = :isCancel", { isCancel: false })
        .getRawOne();

      if (existing) {
        return { success: false, message: "LEAVE_ALREADY_EXISTS_FOR_DATE" };
      }

      // Calculate difference in days (+1 to include both start and end days)
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const leaveCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const leave = this.agentLeaveCalendarRepository.create({
        fk_agent_id: user.id,
        leave_start_date: startDate,
        leave_end_date: endDate,
        leave_count: leaveCount,
        leave_type: dto.leave_type,
        reason: dto.reason,
        is_cancel: false,
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

  async getLeaveList(userId: number, role: string, filters: any) {
    try {
      const { pageNumber = 1, pageLimit = 10, search, is_csv } = filters;
      const page = Number(pageNumber);
      const limit = Number(pageLimit);
      const skip = (page - 1) * limit;

      let query = this.agentLeaveCalendarRepository
        .createQueryBuilder("leave")
        .leftJoin("leave.agent", "agent_user")
        .leftJoin("Agent", "agent", "agent.id = agent_user.role_id")
        .select([
          "leave.id as leave_id",
          "leave.leave_start_date as leave_start_date",
          "leave.leave_end_date as leave_end_date",
          "leave.leave_count as leave_count",
          "leave.leave_type as leave_type",
          "leave.reason as reason",
          "leave.is_cancel as is_cancel",
          "leave.created_at as created_at",
          "agent_user.email as agent_email",
          "agent.first_name as agent_first_name",
          "agent.last_name as agent_last_name",
        ]);

      if (role === UserRole.AGENT) {
        query = query.where("leave.fk_agent_id = :userId", { userId });
      } else if (role === UserRole.MANAGER) {
        // Find manager's ID
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        if (user && user.role_id) {
          query = query.where("agent.fk_manager_id = :managerId", {
            managerId: user.role_id,
          });
        } else {
          return { success: false, message: "MANAGER_NOT_FOUND" };
        }
      }

      if (search) {
        query = query.andWhere(
          "(agent.first_name LIKE :search OR agent.last_name LIKE :search OR agent_user.email LIKE :search)",
          { search: `%${search}%` }
        );
      }

      query = query.orderBy("leave.leave_start_date", "DESC");

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
}
