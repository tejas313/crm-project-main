import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import { TokenExpiredError } from "jsonwebtoken";
import { UserSession } from "src/modules/user/entities/user-session.entity";
import { Repository } from "typeorm";
dotenv.config();

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token = request.headers.refresh_token;
    if (!token) {
      throw new UnauthorizedException("REFRESH_TOKEN_REQUIRED");
    }
    try {
      if (token.startsWith("Bearer")) {
        token = token.split(" ");
        token = token[1];
      }
      const session = await this.userSessionRepository.findOne({
        where: { refresh_token: token },
      });

      if (!session) {
        throw new UnauthorizedException("INVALID_SESSION");
      }
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      if (payload) {
        request.user = {
          userId: payload.userId,
          sessionId: session.id,
        };
      } else throw new UnauthorizedException("REFRESH_MALFORMED");
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ForbiddenException("REFRESH_EXPIRED");
      }
    }
    return true;
  }
}
