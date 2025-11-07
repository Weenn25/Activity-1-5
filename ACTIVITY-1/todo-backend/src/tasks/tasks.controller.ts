import { Controller, Get, Post, Body, Param, Put, Delete, Patch } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getAll() {
    return this.tasksService.findAll();
  }

  @Post()
  create(@Body() body: { title: string; description: string }) {
    return this.tasksService.create(body.title, body.description);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(id, body);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }
}
