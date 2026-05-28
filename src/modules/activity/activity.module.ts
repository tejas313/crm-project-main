import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LeadActivity } from "./entities/lead-activity.entity";
import { LeadAuditTrail } from "./entities/lead-audit-trail.entity";
import { ActivityService } from "./services/activity.service";

@Module({
  imports: [TypeOrmModule.forFeature([LeadActivity, LeadAuditTrail])],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
