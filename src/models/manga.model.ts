import { Schema, model } from 'mongoose';
import IManga from '../interfaces/manga.interface';

const mangaSchema: Schema = new Schema({
  title: { type: String, required: true },
  mangaID: { type: String, required: true },
  jumpLink: { type: String, required: true },
  vizLink: { type: String, required: true },
  jumpImages: [{ type: String, required: false }],
  vizImages: [{ type: String, required: false }],
  authorInfo: { type: String, required: true },
  descriptionJump: { type: String, required: true },
  descriptionViz: { type: String, required: true },
  // recommendedManga: [{ type: String, required: false }],
});

export const Manga = model<IManga>('manga', mangaSchema, 'manga');
