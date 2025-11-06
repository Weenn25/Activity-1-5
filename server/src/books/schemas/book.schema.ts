import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Book extends Document {
  @Prop({ required: true })
  title: string;

  // store author as an optional string (name) instead of requiring an ObjectId
  @Prop({ required: false })
  author?: string;

  @Prop({ required: false })
  description?: string;

  // store categories as an array of strings
  @Prop({ type: [String], required: false, default: [] })
  categories?: string[];
}

export const BookSchema = SchemaFactory.createForClass(Book);
