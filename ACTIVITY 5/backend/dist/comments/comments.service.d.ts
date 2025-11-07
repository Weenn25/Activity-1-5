import { Model } from 'mongoose';
import { Comment } from './comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';
export declare class CommentsService {
    private model;
    private users;
    private posts;
    constructor(model: Model<Comment>, users: UsersService, posts: PostsService);
    create(authorId: string, postId: string, dto: CreateCommentDto): Promise<Comment & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
