import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private model: Model<Post>,
    private usersService: UsersService,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    await this.usersService.findOne(authorId);
    const doc = new this.model({ ...dto, author: new Types.ObjectId(authorId) });
    await doc.save();
    const created = (await doc.populate('author', '-password')).toObject() as any;
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
    const norm = items.map((p: any) => ({
      ...p,
      id: p._id.toString(),
      author: p.author ? { id: p.author._id?.toString?.(), email: p.author.email, username: p.author.username } : undefined,
    }));
    return { items: norm, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const post = await this.model.findById(id).populate('author', '-password').lean() as any;
    if (!post) throw new NotFoundException('Post not found');
    const commentsRaw = await this.model.db.collection('comments').aggregate([
      { $match: { post: new Types.ObjectId(id) } },
      { $sort: { createdAt: -1 } },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' },
      { $project: { 'author.password': 0 } },
    ]).toArray();
    const comments = commentsRaw.map((c: any) => ({ id: c._id, content: c.content, author: { id: c.author._id?.toString?.(), email: c.author.email, username: c.author.username }, createdAt: c.createdAt }));
    return { id: post._id.toString(), title: post.title, body: post.body, createdAt: post.createdAt, updatedAt: post.updatedAt, author: post.author ? { id: post.author._id?.toString?.(), email: post.author.email, username: post.author.username } : undefined, comments } as any;
  }

  async update(id: string, authorId: string, dto: Partial<CreatePostDto>) {
    const post = await this.model.findById(id).lean();
    if (!post) throw new NotFoundException('Post not found');
    if (post.author.toString() !== authorId) throw new ForbiddenException('Not your post');
    await this.model.updateOne({ _id: id }, { $set: dto });
    const updated = await this.model.findById(id).populate('author', '-password').lean() as any;
    return { ...updated, id: updated._id.toString() };
  }

  async remove(id: string, authorId: string) {
    const post = await this.model.findById(id).lean();
    if (!post) throw new NotFoundException('Post not found');
    if (post.author.toString() !== authorId) throw new ForbiddenException('Not your post');
    await this.model.deleteOne({ _id: id });
    return { deleted: true };
  }
}
