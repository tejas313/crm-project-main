import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LeadActivity, ActivityType } from "../entities/lead-activity.entity";

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(LeadActivity)
    private readonly leadActivityRepository: Repository<LeadActivity>
  ) {}

  /**
   * Helper to log lead activities in the DB
   */
  async logLeadActivity(
    leadId: number,
    activityType: ActivityType,
    taskId: number | null,
    description: string,
    performedByUserId: number,
    metadata?: any
  ): Promise<void> {
    try {
      const activity = this.leadActivityRepository.create({
        fk_lead_id: leadId,
        activity_type: activityType,
        fk_task_id: taskId,
        description: description,
        fk_performed_by_user_id: performedByUserId,
        metadata: metadata || null,
      });
      await this.leadActivityRepository.save(activity);
    } catch (error) {
      // Silent catch or log so activity logs do not crash the primary flow
      console.error("Failed to log lead activity:", error);
    }
  }
}
