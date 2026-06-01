import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DialerCalls } from "./entities/dialer-calls.entity";
import { DialerQueue } from "./entities/dialer-queue.entity";
import { WorkingHoursConfig } from "./entities/working-hours-config.entity";

@Injectable()
export class DialerService {
  constructor(
    @InjectRepository(DialerCalls)
    private dialerCallsRepository: Repository<DialerCalls>,
    @InjectRepository(DialerQueue)
    private dialerQueueRepository: Repository<DialerQueue>,
    @InjectRepository(WorkingHoursConfig)
    private workingHoursConfigRepository: Repository<WorkingHoursConfig>
  ) {}
}
