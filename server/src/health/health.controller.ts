import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  async check() {
    try {
      const readyState = this.connection.readyState;
      const db = this.connection.db;
      if (!db) {
        throw new HttpException(
          { ok: false, readyState, message: 'No DB instance available' },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      await db.admin().ping();
      return { ok: true, readyState };
    } catch (err: any) {
      throw new HttpException(
        { ok: false, readyState: this.connection.readyState, message: err?.message || 'DB ping failed' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
