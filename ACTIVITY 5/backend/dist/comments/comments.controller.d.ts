import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsController {
    private comments;
    constructor(comments: CommentsService);
    create(postId: string, body: CreateCommentDto, req: any): Promise<import("./comment.schema").Comment & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
