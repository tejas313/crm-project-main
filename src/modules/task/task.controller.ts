import {
  Controller,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TaskService } from "./task.service";
import { AuthGuard } from "../../guard/auth.guard";
import { ResponseService } from "../../common/response.service";

@ApiTags("Tasks")
@Controller("tasks")
@UseGuards(AuthGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly responseService: ResponseService
  ) {}
}
