import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
export declare class PostsController {
    private posts;
    constructor(posts: PostsService);
    findAll(page?: number, limit?: number): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    create(body: CreatePostDto, req: any): Promise<any>;
    update(id: string, body: Partial<CreatePostDto>, req: any): Promise<any>;
    remove(id: string, req: any): Promise<{
        deleted: boolean;
    }>;
}
