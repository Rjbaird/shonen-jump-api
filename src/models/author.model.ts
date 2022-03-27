import { Schema, model } from 'mongoose';
import Author from '../interfaces/author.interface';

const authorSchema = new Schema(
  {
    name: { type: String, required: true },
    manga: [
      {
        title: { type: String, required: true },
        titleSlug: { type: String, required: true },
        imageUrl: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Author = model<Author>('author', authorSchema, 'author');
