"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mangaSchema = new mongoose_1.Schema({
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
const Manga = (0, mongoose_1.model)('manga', mangaSchema);
