import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as Dotenv from "dotenv";
import * as moment from "moment";
import { DecryptHelper } from "./decryptHelper";

@Injectable()
export class EmailHtmlTemplete {
  constructor(private decryptHelper: DecryptHelper) {}
}
