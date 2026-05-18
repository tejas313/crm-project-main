/* eslint-disable prefer-const */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as createObjectCsvWriter from "csv-writer";
import * as generatePassword from "generate-password";

import { stringify } from "csv-stringify";
import * as fs from "fs";
import * as Dotenv from "dotenv";
import axios from "axios";
import * as csvParser from "csv-parser";
import * as puppeteer from "puppeteer";
import * as path from "path";
import { DecryptHelper } from "./decryptHelper";
import { EmailService } from "./email.service";
import { chromium } from "playwright";
import { Readable } from "stream";
Dotenv.config();
@Injectable()
export class CommonService {
  constructor(
    private decryptHelper: DecryptHelper,
    private emailservice: EmailService
  ) {}

  generateSecurePassword(): string {
    return generatePassword.generate({
      length: 8,
      numbers: true,
      symbols: true,
      lowercase: true,
      uppercase: true,
      strict: true,
    });
  }
}
