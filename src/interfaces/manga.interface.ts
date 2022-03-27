import { Document } from "mongoose";

export default interface IManga extends Document {
  title: String;
  mangaID: String;
  jumpLink: String;
  vizLink: String;
  jumpImageUrl: String;
  // vizImageUrl: String,
  author: String;
  descriptionShort: String;
  // descriptionLong: String,
  numberOfChapters: Number;
  nextChapterCountdown: String;
  recommendedManga: [
    {
      title: String;
      titleSlug: String;
    }
  ];
}
