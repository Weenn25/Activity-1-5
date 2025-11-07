import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from './note.schema';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<NoteDocument>) {}

  async create(ownerId: string, dto: CreateNoteDto) {
    const note = new this.noteModel({ ...dto, owner: ownerId });
    return note.save();
  }

  async findAll(ownerId: string) {
    return this.noteModel.find({ owner: ownerId }).sort({ updatedAt: -1 }).exec();
  }

  async findOne(ownerId: string, id: string) {
    const note = await this.noteModel.findOne({ _id: id, owner: ownerId }).exec();
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async update(ownerId: string, id: string, dto: Partial<CreateNoteDto>) {
    const note = await this.noteModel.findOneAndUpdate(
      { _id: id, owner: ownerId },
      { $set: dto },
      { new: true },
    );
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async remove(ownerId: string, id: string) {
    const res = await this.noteModel.findOneAndDelete({ _id: id, owner: ownerId });
    if (!res) throw new NotFoundException('Note not found');
    return { deleted: true };
  }
}
