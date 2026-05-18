/* eslint-disable @typescript-eslint/no-unused-vars */
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ResponseService } from "src/common/response.service";
import * as Dotenv from "dotenv";
Dotenv.config();

@Injectable()
export class NonAuthHeader implements CanActivate {
  constructor(
    private jwtService: JwtService,
    public responseService: ResponseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    try {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();
      const error: any = await this.validateHeaders(request);

      if (error) {
        throw this.responseService.error(request, response, error, 501, "en");
      } else if (
        request.headers.authorizations !== process.env.DEFAULT_AUTH_TOKEN
      ) {
        const error: string = "INVALID_DEFAULT_TOKEN";
        throw this.responseService.error(request, response, error, 501, "en");
      } else {
        return true;
      }
    } catch (error) {
      console.error("errror", error);
      throw new Error(error);
    }
  }

  async validateHeaders(request: any) {
    try {
      let error: any;
      if (!request.headers.authorizations) {
        return (error = "AUTHORIZATIONS_IS_REQUIRED");
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
