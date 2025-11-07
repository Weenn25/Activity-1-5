import { Model } from 'mongoose';
import { Post } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UsersService } from '../users/users.service';
export declare class PostsService {
    private model;
    private usersService;
    constructor(model: Model<Post>, usersService: UsersService);
    create(authorId: string, dto: CreatePostDto): Promise<any>;
    findAll(page?: number, limit?: number): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, authorId: string, dto: Partial<CreatePostDto>): Promise<any>;
    remove(id: string, authorId: string): Promise<{
        deleted: boolean;
    }>;
}
