import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Controller,
  ValidationPipe,
  ParseUUIDPipe,
  Query,
  UseGuards,
  Headers,
  UseInterceptors,
  UploadedFile,
  Res,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { diskStorage } from "multer";
import { FileInterceptor } from "@nestjs/platform-express";
import { Pagination } from "nestjs-typeorm-paginate";

import { JwtAuthGuard } from "../auth/shared/jwt/jwt-auth.guard";
import { TasksService } from "./tasks.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { editFileName, imageFileFilter } from "../../utils/upload.utils";
import { Task } from "./entities/task.entity";

@ApiTags("Tasks")
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Headers("Authorization") tokenString: string,
    @Body(new ValidationPipe({ errorHttpStatusCode: 422 }))
    createTaskDto: CreateTaskDto
  ) {
    return this.tasksService.create(createTaskDto, tokenString);
  }

  @ApiBearerAuth()
  @ApiQuery({ name: "finished", required: false, type: Boolean })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Headers("Authorization") tokenString: string,
    @Query("page") page = 1,
    @Query("limit") limit = 50,
    @Query("finished") finished?: string
  ): Promise<Pagination<Task>> {
    return this.tasksService.findAll({ page, limit }, finished, tokenString);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(
    @Headers("Authorization") tokenString: string,
    @Param("id", new ParseUUIDPipe()) id: string
  ) {
    return this.tasksService.findOne(id, tokenString);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Headers("Authorization") tokenString: string,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ errorHttpStatusCode: 422 }))
    updateTaskDto: UpdateTaskDto
  ) {
    return this.tasksService.update(id, updateTaskDto, tokenString);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(
    @Headers("Authorization") tokenString: string,
    @Param("id", new ParseUUIDPipe()) id: string
  ) {
    return this.tasksService.remove(id, tokenString);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("/upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination:
          process.env.NODE_ENV === "development" ? "../../../tmp" : "/tmp",
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query("task_id") task_id?: string
  ) {
    return {
      task_id: task_id,
      filename: file.filename,
    };
  }

  @Get("/download/:taskId")
  downloadFile(@Param("taskId") file: Express.Multer.File, @Res() res) {
    return res.sendFile(`${file}.pdf`, {
      root: process.env.NODE_ENV === "development" ? "../../../tmp" : "/tmp",
    });
  }
}
