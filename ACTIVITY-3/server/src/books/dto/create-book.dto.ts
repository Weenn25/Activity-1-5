// src/books/dto/create-book.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, IsMongoId, IsNumber } from 'class-validator';

export class CreateBookDto {
  @ApiProperty() @IsNotEmpty() @IsString() title: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() summary?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() author?: string;
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() @IsString({ each: true }) categories?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() publishedDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() pages?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() isbn?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() coverImage?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}
