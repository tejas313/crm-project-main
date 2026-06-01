import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "src/guard/auth.guard";
import { UseGuards, UsePipes } from "@nestjs/common";
import { ValidationPipe } from "./validation.pipe";
import { RefreshGuard } from "src/guard/refresh.guard";

export function ApiOperationWithSwaggerSummary(summary: string) {
  return ApiOperation({ summary });
}

export function ApiAuthHeaders() {
  return ApiBearerAuth("authorization");
}

export function ApiCommonResponses() {
  return applyDecorators(
    ApiResponse({ status: 200, description: "Api success" }),
    ApiResponse({ status: 401, description: "Invalid Login credentials." }),
    ApiResponse({ status: 404, description: "Not found!" }),
    ApiResponse({ status: 500, description: "Internal server error!" }),
    ApiResponse({
      status: 403,
      description: "Forbidden, The user does not have access.",
    })
  );
}

export function ApiNonAuthCommonDecorators(text = "") {
  return applyDecorators(
    UsePipes(ValidationPipe),
    ApiCommonResponses(),
    ApiOperationWithSwaggerSummary(text)
  );
}
export function ApiAdminRefreshCommonDecorators(text = "") {
  return applyDecorators(
    UseGuards(RefreshGuard),
    UsePipes(ValidationPipe),
    ApiCommonResponses(),
    ApiOperationWithSwaggerSummary(text),
    ApiAuthHeaders()
  );
}

export function ApiCommonDecorators(text = "") {
  return applyDecorators(
    UseGuards(AuthGuard),
    UsePipes(ValidationPipe),
    ApiCommonResponses(),
    ApiOperationWithSwaggerSummary(text),
    ApiAuthHeaders()
  );
}
export function ApiAdminCommonDecorators(text = "") {
  return applyDecorators(
    UseGuards(AuthGuard),
    UsePipes(ValidationPipe),
    ApiCommonResponses(),
    ApiOperationWithSwaggerSummary(text),
    ApiAuthHeaders()
  );
}
