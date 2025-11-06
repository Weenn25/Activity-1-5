import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { Book } from './schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';

type BookDocument = Book & Document;

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>) {}

  async create(createBookDto: CreateBookDto): Promise<BookDocument> {
    try {
      const createdBook = new this.bookModel(createBookDto);
      return await createdBook.save();
    } catch (err: any) {
      // Log error server-side and return 500 with message
      console.error('BooksService.create error:', err);
      throw new HttpException(err?.message || 'Failed to create book', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<BookDocument[]> {
    try {
      return await this.bookModel.find().exec();
    } catch (err: any) {
      console.error('BooksService.findAll error:', err);
      throw new HttpException('Failed to fetch books', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<BookDocument | null> {
    try {
      return await this.bookModel.findById(id).exec();
    } catch (err: any) {
      console.error('BooksService.findOne error:', err);
      throw new HttpException('Failed to fetch book', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, updateBookDto: Partial<Book>): Promise<BookDocument | null> {
    try {
      return await this.bookModel.findByIdAndUpdate(id, updateBookDto, { new: true }).exec();
    } catch (err: any) {
      console.error('BooksService.update error:', err);
      throw new HttpException('Failed to update book', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string): Promise<BookDocument | null> {
    try {
      return await this.bookModel.findByIdAndDelete(id).exec();
    } catch (err: any) {
      console.error('BooksService.remove error:', err);
      throw new HttpException('Failed to delete book', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
