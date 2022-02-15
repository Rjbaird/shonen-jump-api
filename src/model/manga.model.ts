import { Schema, model } from 'mongoose';

const mangaSchema = new Schema({
  id: Number,
  title: String,
  titleSlug: String,
  jumpLink: String,
  vizLink: String,
  jumpImageUrl: String,
  vizImageUrl: String,
  author: String,
  descriptionShort: String,
  descriptionLong: String,
  numberOfChapters: Number,
  nextChapterCountdown: String,
  recommendedManga: [
    {
      title: String,
      titleSlug: String,
    },
  ],
});


const Manga = model('manga', mangaSchema)