import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

function toSafeUser(doc: any) {
  if (!doc) return null;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const { password, _id, id, ...rest } = obj;
  return { id: id || _id?.toString?.(), ...rest };
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<User>) {}

  async create(dto: CreateUserDto) {
    const existing = await this.model.findOne({ $or: [{ email: dto.email }, { username: dto.username }] });
    if (existing) throw new ConflictException('Email or username already used');
    const doc = new this.model({ ...dto, password: await bcrypt.hash(dto.password, 10) });
    await doc.save();
    return toSafeUser(doc);
  }

  findAll() {
    return this.model.find().lean().then(list => list.map(toSafeUser));
  }

  async findOne(id: string) {
    const user = await this.model.findById(id).lean();
    if (!user) throw new NotFoundException('User not found');
    return toSafeUser(user);
  }

  async findByEmailOrUsername(emailOrUsername: string) {
    const user = await this.model.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] }).lean();
    return user ? { ...user, id: (user as any)._id?.toString?.() } : null;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('User not found');
    return { deleted: true };
  }
}
