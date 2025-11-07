"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const comment_schema_1 = require("./comment.schema");
const users_service_1 = require("../users/users.service");
const posts_service_1 = require("../posts/posts.service");
let CommentsService = class CommentsService {
    model;
    users;
    posts;
    constructor(model, users, posts) {
        this.model = model;
        this.users = users;
        this.posts = posts;
    }
    async create(authorId, postId, dto) {
        await this.users.findOne(authorId);
        const post = await this.posts.findOne(postId);
        if (String(post.author._id || post.author.id) === String(authorId)) {
            throw new common_1.ForbiddenException('You cannot comment on your own post');
        }
        const doc = new this.model({ ...dto, author: new mongoose_2.Types.ObjectId(authorId), post: new mongoose_2.Types.ObjectId(postId) });
        await doc.save();
        return doc.toObject();
    }
    async remove(id) {
        const res = await this.model.findByIdAndDelete(id);
        if (!res)
            throw new common_1.NotFoundException('Comment not found');
        return { deleted: true };
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(comment_schema_1.Comment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_1.UsersService,
        posts_service_1.PostsService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map