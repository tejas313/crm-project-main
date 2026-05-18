import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
} from "@nestjs/common";

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    let message = exception.getResponse()["message"] || "Validation failed";
    if (typeof message != "string") message = message[0];
    response.status(status).json({
      code: 0,
      status: "FAIL",
      message: message,
    });
  }
}
