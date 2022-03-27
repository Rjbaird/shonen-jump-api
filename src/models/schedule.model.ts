import { Schema, model } from 'mongoose';
import ISchedule from '../interfaces/schedule.interface';

const scheduleSchema = new Schema(
  {
    title: { type: String, required: true },
    chapterRelease: { type: Number, required: true },
    upcomingChapter: { type: String, required: true },
    releaseDateString: { type: String, required: true },
    unixReleaseDate: { type: Number, required: true },
  },
  { versionKey: false }
);

export const Schedule = model<ISchedule>('schedule', scheduleSchema, 'schedule');
