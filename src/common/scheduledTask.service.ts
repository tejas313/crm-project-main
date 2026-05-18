// 3. Schedule with Cron
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ScheduledTaskService {
  private readonly logger = new Logger(ScheduledTaskService.name);

  constructor() {} // private readonly meetingScraperService: MeetingScraperService
}
