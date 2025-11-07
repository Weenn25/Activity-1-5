import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private model: Model<Comment>,
    private users: UsersService,
    private posts: PostsService,
  ) {}

  async create(authorId: string, postId: string, dto: CreateCommentDto) {
    await this.users.findOne(authorId);
    const post = await this.posts.findOne(postId);
    if (String(post.author._id || post.author.id) === String(authorId)) {
      throw new ForbiddenException('You cannot comment on your own post');
    }
    const doc = new this.model({ ...dto, author: new Types.ObjectId(authorId), post: new Types.ObjectId(postId) });
    await doc.save();
    return doc.toObject();
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Comment not found');
    return { deleted: true };
  }
}
