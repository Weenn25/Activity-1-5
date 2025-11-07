import { Controller, Post as HttpPost, Param, Body, Delete, UseGuards, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/jwt-auth.guard';

@ApiTags('comments')
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private comments: CommentsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpPost()
  create(@Param('postId') postId: string, @Body() body: CreateCommentDto, @Req() req: any) {
    return this.comments.create(req.user.userId, postId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comments.remove(id);
  }
}
