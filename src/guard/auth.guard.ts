/* eslint-disable prettier/prettier */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TokenExpiredError } from "jsonwebtoken";
import { UserSession } from "src/modules/user/entities/user-session.entity";
import { UserRole } from "src/modules/user/entities/user.entity";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Task requirement: headers inside authorizations key required
    const token = request.headers.authorizations;
    
    if (!token) {
      throw new UnauthorizedException("AUTH_TOKEN_REQUIRED");
    }

    try {
      // Check if token exists in user_sessions table
      const session = await this.userSessionRepository.findOne({
        where: { token: token },
      });

      if (!session) {
        throw new UnauthorizedException("INVALID_SESSION");
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      if (!payload) {
        throw new UnauthorizedException("TOKEN_MALFORMED");
      }

      // Check for valid roles: admin, manager, agent
      const validRoles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT];
      if (!validRoles.includes(payload.role)) {
        throw new ForbiddenException("INVALID_ROLE");
      }

      // Attach user info to request
      request.user = {
        userId: payload.userId,
        role: payload.role,
        role_id: payload.role_id,
      };

      // Also support legacy body attachment if needed by existing code
      // request.body.user_id = payload.sub;
      // request.body.user_type = payload.role;

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ForbiddenException("TOKEN_EXPIRED");
      }
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException("INVALID_TOKEN");
    }
  }
}
