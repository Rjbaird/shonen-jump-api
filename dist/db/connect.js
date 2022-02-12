"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOneManga = exports.getAllManga = exports.getUpcomingReleases = exports.connect = void 0;
const logger_1 = __importDefault(require("../logger"));
const mongoose_1 = __importDefault(require("mongoose"));
const memory_1 = require("../db/memory");
const utils_1 = require("../utils");
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
// TODO: Debug MongoDB connection issues
const connect = () => __awaiter(void 0, void 0, void 0, function* () {
    const dbUri = process.env.DB_URI;
    try {
        mongoose_1.default.connect(dbUri).then(() => {
            logger_1.default.info('Database Connected!');
        });
    }
    catch (error) { }
    logger_1.default.error('Database error');
    process.exit(1);
});
exports.connect = connect;
// Data Collection Functions
const getAllManga = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://www.viz.com/shonenjump';
    (0, axios_1.default)(url)
        .then(response => {
        const html = response.data;
        const $ = cheerio_1.default.load(html);
        let allManga = $('.o_sortable');
        let chapterNumberRegex = /\d+/g;
        allManga.each((i, e) => {
            let title = `${$(e).find('img').attr('alt')}`;
            let mangaLink = `${$(e).find('a').attr('href')}`;
            let mangaID = mangaLink.replace('/shonenjump/chapters/', '').trim();
            let newestChapterLink = `${$(e).find('.o_inner-link').attr('href')}`;
            let latestChapterNumber = $(e)
                .find('span')
                .first()
                .text()
                .trim()
                .match(chapterNumberRegex);
            let latestChapterDate = $(e).find('.style-italic').first().text().trim();
            const viz = 'https://www.viz.com';
            const chapterObject = {
                title: title,
                mangaID: mangaID,
                mangaLink: `${viz}${mangaLink}`,
                newestChapterLink: `${viz}${newestChapterLink}`,
                latestChapterDate: (0, utils_1.parseChapterDate)(latestChapterDate),
                latestChapterNumber: (0, utils_1.parseChapterNumber)(latestChapterNumber),
            };
            memory_1.mangaList.push(chapterObject);
        });
    })
        .catch(error => logger_1.default.info(error));
    logger_1.default.info('Manga List Updated');
});
exports.getAllManga = getAllManga;
const getOneManga = (mangaId) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://www.viz.com/shonenjump/chapters/${mangaId}`;
    const mangaJson = (0, axios_1.default)(url)
        .then(response => {
        const html = response.data;
        const $ = cheerio_1.default.load(html);
        let recommendedManga = [];
        let title = $('#series-intro').find('h2').text();
        let headerImageUrl = `${$('.o_hero-media').attr('src')}`;
        let author = $('.disp-bl--bm').text().replace('Created by ', '').trim();
        let description = $('h4', '.mar-t-rg').text();
        let nextReleaseDate = $('.section_future_chapter').text().trim();
        $('.o_property-link').each((i, e) => {
            let recommendedTitle = `${$(e).attr('rel')}`;
            let recommendedLink = `${$(e).attr('href')}`;
            let recommendedSlug = recommendedLink.replace('/shonenjump/chapters/', '');
            let recommendation_obj = {
                title: recommendedTitle,
                titleSlug: recommendedSlug,
                link: `https://www.viz.com${recommendedLink}`,
            };
            recommendedManga[i] = recommendation_obj;
        });
        recommendedManga.join(', ');
        const mangaData = {
            title: `${title}`,
            headerImageUrl: `${headerImageUrl}`,
            author: `${author}`,
            description: `${description}`,
            nextReleaseCountdown: (0, utils_1.parseChapterDate)(nextReleaseDate),
            recommendedManga: recommendedManga,
        };
        return mangaData;
    })
        .catch(error => logger_1.default.info(error));
    return mangaJson;
});
exports.getOneManga = getOneManga;
const getUpcomingReleases = (date) => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://www.viz.com/shonen-jump-chapter-schedule';
    (0, axios_1.default)(url)
        .then(response => {
        const html = response.data;
        const $ = cheerio_1.default.load(html);
        let table_row = $('tr');
        let chapterRegex = /Ch\.\s\d+/g;
        let chapterNumberRegex = /\d+/g;
        let nextReleaseRegex = /\w\w\w,\s\w\w\w\s\d+/g;
        table_row.each((i, e) => {
            let row = $(e).text();
            let title = `${row.split(',', 1)}`;
            let upcomingChapter = `${row.match(chapterRegex)}`;
            let numOfChapters = `${`${upcomingChapter}`.match(chapterNumberRegex)}`;
            let nextChapterReleaseDate = `${row.match(nextReleaseRegex)}`;
            let unixReleaseDate = Date.parse(nextChapterReleaseDate);
            const chapterObject = {
                title: title,
                chapterRelease: parseInt(numOfChapters),
                upcomingChapter: upcomingChapter,
                release_date: nextChapterReleaseDate,
            };
            if (unixReleaseDate >= date) {
                return memory_1.chapterSchedule.push(chapterObject);
            }
        });
        memory_1.chapterSchedule.shift(); // Remove table headers
        // chapterSchedule.pop(); // Remove table footer
    })
        .catch(error => logger_1.default.info(error));
    logger_1.default.info('Schedule Updated');
});
exports.getUpcomingReleases = getUpcomingReleases;
