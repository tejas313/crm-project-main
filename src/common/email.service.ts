/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createTransport, Transporter } from "nodemailer";

import * as Dotenv from "dotenv";
import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as fs from "fs";
import { join, dirname } from "path";
import * as handlebars from "handlebars";
import * as path from "path";
import { EmailHtmlTemplete } from "./emailHtml.service";
Dotenv.config();

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private emailTemHtml:EmailHtmlTemplete;

  constructor() {
 
  }
}
