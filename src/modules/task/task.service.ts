import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task, TaskStatus, TaskType } from "./entities/task.entity";
import { Lead, LeadStage } from "../lead/entities/lead.entity";
import { User } from "../user/entities/user.entity";
import { ActivityType } from "../activity/entities/lead-activity.entity";
import { AddOrEditTaskDto } from "./dto/add-or-edit-task.dto";
import { TaskListFiltersDto } from "./dto/task-list-filters.dto";
import { ActivityService } from "../activity/services/activity.service";

export interface TaskResponse {
  success: boolean;
  message: string;
  data: Task;
}

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly activityService: ActivityService
  ) {}

  /**
   * Helper to calculate reminder_at timestamp based on scheduled_at and reminder_minutes
   */
  private calculateReminderAt(
    scheduledAtStr: string,
    reminderMinutes?: number,
    reminderAtStr?: string
  ): Date | null {
    if (reminderMinutes !== undefined && reminderMinutes !== null) {
      const scheduledTime = new Date(scheduledAtStr).getTime();
      return new Date(scheduledTime - reminderMinutes * 60 * 1000);
    }
    if (reminderAtStr) {
      return new Date(reminderAtStr);
    }
    return null;
  }

  /**
   * Helper to transition lead stage based on task type
   */
  private async updateLeadStage(
    lead: Lead,
    taskType: TaskType,
    performedByUserId: number,
    taskId: number
  ): Promise<void> {
    const oldStage = lead.lead_stage;
    let stageChanged = false;

    if (taskType === TaskType.APPOINTMENT) {
      if (lead.lead_stage !== LeadStage.APPOINTMENT_SCHEDULED) {
        lead.lead_stage = LeadStage.APPOINTMENT_SCHEDULED;
        stageChanged = true;
      }
      lead.appointment_set_at = new Date();
    } else if (taskType === TaskType.PRESENTATION) {
      if (lead.lead_stage !== LeadStage.PRESENTATION_COMPLETED) {
        lead.lead_stage = LeadStage.PRESENTATION_COMPLETED;
        stageChanged = true;
      }
    } else if (taskType === TaskType.FOLLOW_UP) {
      if (lead.lead_stage !== LeadStage.FOLLOW_UP) {
        lead.lead_stage = LeadStage.FOLLOW_UP;
        stageChanged = true;
      }
    }

    if (stageChanged) {
      await this.leadRepository.save(lead);
      await this.activityService.logLeadActivity(
        lead.id,
        ActivityType.STAGE_CHANGED,
        taskId,
        `Lead stage changed from "${oldStage}" to "${lead.lead_stage}" due to task scheduling.`,
        performedByUserId,
        { old_stage: oldStage, new_stage: lead.lead_stage }
      );
    }
  }

  /**
   * Unified Save (Add or Edit) Task Flow
   */
  async addOrEditTask(
    dto: AddOrEditTaskDto,
    performedByUserId: number
  ): Promise<TaskResponse> {
    // 1. Validate Lead exists and is active
    const lead = await this.leadRepository.findOne({
      where: { id: dto.fk_lead_id, is_deleted: 0 },
    });
    if (!lead) {
      throw new NotFoundException("ASSOCIATED_LEAD_NOT_FOUND");
    }

    // 2. Validate Owner exists and is active
    const owner = await this.userRepository.findOne({
      where: { id: dto.fk_owner_id, is_deleted: 0, is_active: true },
    });
    if (!owner) {
      throw new NotFoundException("OWNER_NOT_FOUND_OR_INACTIVE");
    }

    // 3. Prevent active task scheduling if the lead is invalid
    const activeTaskTypes = [
      TaskType.APPOINTMENT,
      TaskType.PRESENTATION,
      TaskType.FOLLOW_UP,
      TaskType.CALL,
    ];

    if (
      lead.is_valid_lead === 0 &&
      dto.task_type &&
      activeTaskTypes.includes(dto.task_type)
    ) {
      throw new BadRequestException(
        "CANNOT_SCHEDULE_ACTIVE_TASK_FOR_INVALID_LEAD"
      );
    }

    const scheduledDate = new Date(dto.scheduled_at);
    if (isNaN(scheduledDate.getTime())) {
      throw new BadRequestException("INVALID_SCHEDULED_DATE");
    }

    // 4. Calculate reminder_at
    let reminderAt = this.calculateReminderAt(
      dto.scheduled_at,
      dto.reminder_minutes,
      dto.reminder_at
    );

    // Default to 15 minutes prior for Appointment task if not explicitly provided
    if (!reminderAt && dto.task_type === TaskType.APPOINTMENT) {
      reminderAt = new Date(scheduledDate.getTime() - 15 * 60 * 1000);
    }

    if (dto.id) {
      // --- EDIT MODE ---
      const existingTask = await this.taskRepository.findOne({
        where: { id: dto.id, is_deleted: 0 },
      });
      if (!existingTask) {
        throw new NotFoundException("TASK_NOT_FOUND");
      }

      // Check if status transitioned to Completed
      if (
        dto.status === TaskStatus.COMPLETED &&
        existingTask.status !== TaskStatus.COMPLETED
      ) {
        existingTask.completed_at = new Date();
        existingTask.fk_completed_by = performedByUserId;
        if (dto.completion_notes) {
          existingTask.completion_notes = dto.completion_notes;
        }
      }

      // Check if status transitioned to Cancelled
      if (
        dto.status === TaskStatus.CANCELLED &&
        existingTask.status !== TaskStatus.CANCELLED
      ) {
        existingTask.cancelled_at = new Date();
        existingTask.fk_cancelled_by = performedByUserId;
        if (dto.cancellation_reason) {
          existingTask.cancellation_reason = dto.cancellation_reason;
        }
      }

      // Rescheduling Logic: Reset status to Pending if rescheduled and current status is Pending or Overdue
      const originalScheduledAt = new Date(existingTask.scheduled_at).getTime();
      const newScheduledAt = scheduledDate.getTime();
      const isRescheduled = originalScheduledAt !== newScheduledAt;

      if (isRescheduled) {
        if (
          existingTask.status === TaskStatus.OVERDUE ||
          existingTask.status === TaskStatus.PENDING
        ) {
          existingTask.status = TaskStatus.PENDING;
        }
      }

      // Update task fields
      existingTask.subject = dto.subject;
      existingTask.fk_lead_id = dto.fk_lead_id;
      existingTask.fk_owner_id = dto.fk_owner_id;
      existingTask.scheduled_at = scheduledDate;
      existingTask.description = dto.description ?? existingTask.description;
      existingTask.priority = dto.priority ?? existingTask.priority;
      existingTask.status = dto.status ?? existingTask.status;

      if (dto.task_type) {
        existingTask.task_type = dto.task_type;
      }

      if (reminderAt) {
        existingTask.reminder_at = reminderAt;
      }

      const savedTask = await this.taskRepository.save(existingTask);

      // Transition lead stage based on task type
      if (dto.task_type) {
        await this.updateLeadStage(
          lead,
          dto.task_type,
          performedByUserId,
          savedTask.id
        );
      }

      // Log Lead Activity (TASK_UPDATED)
      await this.activityService.logLeadActivity(
        dto.fk_lead_id,
        ActivityType.TASK_UPDATED,
        savedTask.id,
        `Task updated: ${dto.subject}`,
        performedByUserId,
        {
          task_id: savedTask.task_id,
          scheduled_at: savedTask.scheduled_at,
          status: savedTask.status,
          task_type: savedTask.task_type,
        }
      );

      // Log specific Appointment/Presentation updates
      if (dto.task_type === TaskType.APPOINTMENT) {
        await this.activityService.logLeadActivity(
          dto.fk_lead_id,
          ActivityType.APPOINTMENT_UPDATED,
          savedTask.id,
          `Appointment updated: ${dto.subject}`,
          performedByUserId,
          { task_id: savedTask.task_id, scheduled_at: savedTask.scheduled_at }
        );
      } else if (dto.task_type === TaskType.PRESENTATION) {
        await this.activityService.logLeadActivity(
          dto.fk_lead_id,
          ActivityType.PRESENTATION_UPDATED,
          savedTask.id,
          `Presentation updated: ${dto.subject}`,
          performedByUserId,
          { task_id: savedTask.task_id, scheduled_at: savedTask.scheduled_at }
        );
      }

      return {
        success: true,
        message: "TASK_UPDATED_SUCCESSFULLY",
        data: savedTask,
      };
    } else {
      // --- ADD MODE ---
      // Generate a unique task ID
      const timestamp = Date.now().toString().slice(-6);
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const generatedTaskId = `TSK-${randomDigits}-${timestamp}`;

      const task = this.taskRepository.create({
        task_id: generatedTaskId,
        fk_lead_id: dto.fk_lead_id,
        fk_owner_id: dto.fk_owner_id,
        subject: dto.subject,
        description: dto.description || null,
        scheduled_at: scheduledDate,
        reminder_at: reminderAt,
        task_type: dto.task_type || TaskType.GENERAL,
        priority: dto.priority || "medium",
        status: dto.status || TaskStatus.PENDING,
        fk_created_by_user_id: performedByUserId,
        is_deleted: 0,
      });

      const savedTask = await this.taskRepository.save(task);

      // Transition lead stage based on task type
      if (dto.task_type) {
        await this.updateLeadStage(
          lead,
          dto.task_type,
          performedByUserId,
          savedTask.id
        );
      }

      // Log Lead Activity (TASK_CREATED)
      await this.activityService.logLeadActivity(
        dto.fk_lead_id,
        ActivityType.TASK_CREATED,
        savedTask.id,
        `New task created: ${dto.subject}`,
        performedByUserId,
        {
          task_id: savedTask.task_id,
          scheduled_at: savedTask.scheduled_at,
          status: savedTask.status,
          task_type: savedTask.task_type,
        }
      );

      // Log specific Appointment/Follow-up creations
      if (dto.task_type === TaskType.APPOINTMENT) {
        await this.activityService.logLeadActivity(
          dto.fk_lead_id,
          ActivityType.APPOINTMENT_CREATED,
          savedTask.id,
          `Appointment created: ${dto.subject}`,
          performedByUserId,
          { task_id: savedTask.task_id, scheduled_at: savedTask.scheduled_at }
        );
      } else if (dto.task_type === TaskType.FOLLOW_UP) {
        await this.activityService.logLeadActivity(
          dto.fk_lead_id,
          ActivityType.FOLLOW_UP_CREATED,
          savedTask.id,
          `Follow-up created: ${dto.subject}`,
          performedByUserId,
          { task_id: savedTask.task_id, scheduled_at: savedTask.scheduled_at }
        );
      }

      return {
        success: true,
        message: "TASK_CREATED_SUCCESSFULLY",
        data: savedTask,
      };
    }
  }

  /**
   * Get List of Tasks using raw queries with getRawMany and normal left joins
   * Required fields: subject, lead_id, owner, descriptions, schedule details and status details
   */
  async getTaskList(filters: TaskListFiltersDto) {
    try {
      const {
        pageNumber = 1,
        pageLimit = 10,
        search,
        status,
        task_type,
        is_csv,
      } = filters;

      const page = Number(pageNumber);
      const limit = Number(pageLimit);
      const skip = (page - 1) * limit;

      let query = this.taskRepository
        .createQueryBuilder("task")
        .leftJoin("leads", "lead", "lead.id = task.fk_lead_id")
        .leftJoin("users", "owner", "owner.id = task.fk_owner_id")
        .select([
          "task.id as id",
          "task.task_id as task_id",
          "task.subject as subject",
          "task.description as description",
          "task.task_type as task_type",
          "task.priority as priority",
          "task.scheduled_at as scheduled_at",
          "task.due_date as due_date",
          "task.reminder_at as reminder_at",
          "task.status as status",
          "lead.lead_id as lead_id",
          "CONCAT_WS(' ', lead.first_name, lead.last_name) as lead_name",
          "CONCAT_WS(' ', owner.first_name, owner.last_name) as owner_name",
        ])
        .where("task.is_deleted = 0");

      if (search) {
        query = query.andWhere(
          "(task.subject LIKE :search OR task.description LIKE :search OR lead.first_name LIKE :search OR lead.last_name LIKE :search OR owner.first_name LIKE :search OR owner.last_name LIKE :search)",
          { search: `%${search}%` }
        );
      }

      if (status) {
        query = query.andWhere("task.status = :status", { status });
      }

      if (task_type) {
        query = query.andWhere("task.task_type = :task_type", { task_type });
      }

      query = query.orderBy("task.scheduled_at", "DESC");

      if (Number(is_csv) === 1) {
        const rawData = await query.getRawMany();
        return {
          success: true,
          data: { csvdata: rawData },
        };
      } else {
        const [rawData, count] = await Promise.all([
          query.limit(limit).offset(skip).getRawMany(),
          query.getCount(),
        ]);

        const totalPages = Math.ceil(count / limit);

        return {
          success: true,
          data: rawData,
          total_count: count,
          current_page: page,
          total_pages: totalPages,
          per_page: limit,
        };
      }
    } catch (error) {
      throw error;
    }
  }
}
