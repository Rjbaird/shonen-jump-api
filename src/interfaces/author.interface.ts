import { Document } from "mongoose";

export default interface IAuthor extends Document {
  name: String;
  manga: [
    {
      title: String;
      titleSlug: String;
      imageUrl: String;
    }
  ];
}
