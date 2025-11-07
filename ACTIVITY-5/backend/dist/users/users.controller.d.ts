import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    create(body: CreateUserDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
