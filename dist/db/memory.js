"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeMessage = exports.chapterSchedule = exports.mangaList = void 0;
// Server Memory
let mangaList = [];
exports.mangaList = mangaList;
let chapterSchedule = [];
exports.chapterSchedule = chapterSchedule;
const welcomeMessage = {
    title: 'Welcome to the unofficial shonen-jump-api',
    description: 'An API showing data about English translations of Weekly Shonen Jump available on Viz.com',
    repo: 'https://github.com/Rjbaird/shonen-jump-api',
    help: 'https://github.com/Rjbaird/shonen-jump-api/issues',
    rapidAPI: 'https://rapidapi.com/Rjbaird/api/unofficial-shonen-jump',
    endpoints: ['/manga', '/manga/:mangaID', '/schedule']
};
exports.welcomeMessage = welcomeMessage;
