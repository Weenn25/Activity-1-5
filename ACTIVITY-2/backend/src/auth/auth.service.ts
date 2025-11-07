import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new Error('Email already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = new this.userModel({ name, email, password: hashed });
    return user.save();
  }

  async validateUser(email: string, pass: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) return null;

    const ok = await bcrypt.compare(pass, user.password);
    if (ok) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id, email: user.email, name: user.name };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
