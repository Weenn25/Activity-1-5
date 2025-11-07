import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwt: JwtService) {}

  async validateUser(emailOrUsername: string, password: string) {
    const user = await this.usersService.findByEmailOrUsername(emailOrUsername);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const { password: _p, ...safe } = user;
    return safe;
  }

  async login(emailOrUsername: string, password: string) {
    const user = await this.validateUser(emailOrUsername, password);
    const token = await this.jwt.signAsync({ sub: user.id, username: user.username });
    return { access_token: token, user };
  }
}
