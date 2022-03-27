import { Document } from "mongoose";

export default interface ISchedule extends Document {
  title: String;
  chapterRelease: Number;
  upcomingChapter: String;
  releaseDate: Date;
}
