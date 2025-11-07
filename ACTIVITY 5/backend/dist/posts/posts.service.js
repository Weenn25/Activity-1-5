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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const post_schema_1 = require("./post.schema");
const users_service_1 = require("../users/users.service");
let PostsService = class PostsService {
    model;
    usersService;
    constructor(model, usersService) {
        this.model = model;
        this.usersService = usersService;
    }
    async create(authorId, dto) {
        await this.usersService.findOne(authorId);
        const doc = new this.model({ ...dto, author: new mongoose_2.Types.ObjectId(authorId) });
        await doc.save();
        const created = (await doc.populate('author', '-password')).toObject();
        return { ...created, id: created._id.toString() };
    }
    async findAll(page = 1, limit = 10) {
        const [items, total] = await Promise.all([
            this.model
                .find()
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('author', '-password')
                .lean(),
            this.model.countDocuments(),
        ]);
        const norm = items.map((p) => ({
            ...p,
            id: p._id.toString(),
            author: p.author ? { id: p.author._id?.toString?.(), email: p.author.email, username: p.author.username } : undefined,
        }));
        return { items: norm, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const post = await this.model.findById(id).populate('author', '-password').lean();
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const commentsRaw = await this.model.db.collection('comments').aggregate([
            { $match: { post: new mongoose_2.Types.ObjectId(id) } },
            { $sort: { createdAt: -1 } },
            { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
            { $unwind: '$author' },
            { $project: { 'author.password': 0 } },
        ]).toArray();
        const comments = commentsRaw.map((c) => ({ id: c._id, content: c.content, author: { id: c.author._id?.toString?.(), email: c.author.email, username: c.author.username }, createdAt: c.createdAt }));
        return { id: post._id.toString(), title: post.title, body: post.body, createdAt: post.createdAt, updatedAt: post.updatedAt, author: post.author ? { id: post.author._id?.toString?.(), email: post.author.email, username: post.author.username } : undefined, comments };
    }
    async update(id, authorId, dto) {
        const post = await this.model.findById(id).lean();
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        if (post.author.toString() !== authorId)
            throw new common_1.ForbiddenException('Not your post');
        await this.model.updateOne({ _id: id }, { $set: dto });
        const updated = await this.model.findById(id).populate('author', '-password').lean();
        return { ...updated, id: updated._id.toString() };
    }
    async remove(id, authorId) {
        const post = await this.model.findById(id).lean();
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        if (post.author.toString() !== authorId)
            throw new common_1.ForbiddenException('Not your post');
        await this.model.deleteOne({ _id: id });
        return { deleted: true };
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_1.UsersService])
], PostsService);
//# sourceMappingURL=posts.service.js.map