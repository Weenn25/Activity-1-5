import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';


@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notes')
export class NotesController {
  constructor(private svc: NotesService) {}

  @Post()
  create(@Request() req: ExpressRequest, @Body() dto: CreateNoteDto) {
    const user = req.user as { userId: string };
    return this.svc.create(user.userId, dto);
  }

  @Get()
  findAll(@Request() req: ExpressRequest) {
    const user = req.user as { userId: string };
    return this.svc.findAll(user.userId);
  }

  @Get(':id')
  findOne(@Request() req: ExpressRequest, @Param('id') id: string) {
    const user = req.user as { userId: string };
    return this.svc.findOne(user.userId, id);
  }

  @Put(':id')
  update(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Body() dto: Partial<CreateNoteDto>,
  ) {
    const user = req.user as { userId: string };
    return this.svc.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: ExpressRequest, @Param('id') id: string) {
    const user = req.user as { userId: string };
    return this.svc.remove(user.userId, id);
  }
}
