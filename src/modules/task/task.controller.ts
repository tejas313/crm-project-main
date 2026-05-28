import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";
import { Response } from "express";
import { TaskService } from "./task.service";
import { AddOrEditTaskDto } from "./dto/add-or-edit-task.dto";
import { AuthGuard } from "../../guard/auth.guard";
import { ResponseService } from "../../common/response.service";
import { TaskListFiltersDto } from "./dto/task-list-filters.dto";
import { Get, Query } from "@nestjs/common";

@ApiTags("Tasks")
@Controller("tasks")
@UseGuards(AuthGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly responseService: ResponseService
  ) {}

  @Post("addOrEditTask")
  @ApiHeader({
    name: "authorizations",
    description: "Authorization header",
    required: true,
  })
  @ApiOperation({
    summary: "Add or Edit Task",
    description:
      "Unified endpoint for creating (adding) or updating (editing) a task based on the provided fields.",
  })
  @ApiResponse({
    status: 200,
    description: "Task has been successfully saved.",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - validation failed.",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized.",
  })
  @ApiResponse({
    status: 404,
    description: "Not found - associated lead or owner does not exist.",
  })
  async addOrEditTask(
    @Body() dto: AddOrEditTaskDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      const performedByUserId = req.user.userId;
      const result = await this.taskService.addOrEditTask(
        dto,
        performedByUserId
      );
      return this.responseService.success(
        res,
        result.message || "SUCCESS",
        result.data
      );
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }

  @Get("getTaskList")
  @ApiHeader({
    name: "authorizations",
    description: "Authorization header",
    required: true,
  })
  @ApiOperation({
    summary: "Get Task List",
    description:
      "Get list of tasks with pagination, searching, filtering, and optional CSV export.",
  })
  @ApiResponse({
    status: 200,
    description: "Task list retrieved successfully.",
  })
  async getTaskList(
    @Query() filters: TaskListFiltersDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      const result = await this.taskService.getTaskList(filters);
      return this.responseService.success(
        res,
        "Task list retrieved successfully",
        result
      );
    } catch (error: any) {
      if (error.status) {
        this.responseService.error(req, res, error.message, error.status);
      } else {
        this.responseService.error(req, res, error.message);
      }
    }
  }
}
