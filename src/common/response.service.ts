import { Injectable, Logger } from "@nestjs/common";
import * as messages from "./messages.json";

@Injectable()
export class ResponseService {
  private readonly logger = new Logger(ResponseService.name);

  async error(req: any, res: any, msg: any, statusCode = 500, language = "en") {
    if (typeof msg === "string") {
      msg = await this.getMessage(msg, language);
    }
    const response = {
      code: 0,
      status: "FAIL",
      message: msg,
    };

    const d = new Date();
    const formatted_date = `${d.getFullYear()}-${
      d.getMonth() + 1
    }-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
    msg = typeof msg == "object" ? JSON.stringify(msg) : msg;
    this.logger.error(
      `[${formatted_date}] ${req.method}:${req.originalUrl} ${msg}`
    );

    res.status(statusCode).json(response);
  }

  async success(
    res: any,
    msg: any,
    data: any,
    statusCode = 200,
    language = "en"
  ) {
    try {
      if (typeof msg === "string") {
        msg = await this.getMessage(msg, language);
      }
      const response = {
        code: 1,
        status: "SUCCESS",
        message: msg,
        data: data /* ? data : {} */,
      };

      res.status(statusCode).json(response);
    } catch (error) {
      console.log(`\nsuccess error ->> `, error);
      return;
    }
  }

  getMessage(msg: string, language: string) {
    const lang = language ? language : "en";
  
    return messages[lang][msg] || msg;
    return messages[lang][msg] || messages[lang]["SOMETHING_WENT_WRONG"];

  }

  async errorInventoy(req: any, res: any, msg: any, statusCode = 500) {
    const response = {
      code: 0,
      status: "FAIL",
      message: msg,
    };
    res.status(statusCode).json(response);
  }
}
