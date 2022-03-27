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
exports.scrapJumpManga = void 0;
const logger_1 = __importDefault(require("../logger"));
const utils_1 = require("../utils");
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const scrapJumpManga = (mangaID) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://www.viz.com/shonenjump/chapters/${mangaID}`;
    const mangaJson = (0, axios_1.default)(url)
        .then(response => {
        const html = response.data;
        const $ = cheerio_1.default.load(html);
        let recommendedManga = [];
        let title = $('#series-intro').find('h2').text();
        let headerImageUrl = `${$('.o_hero-media').attr('src')}`;
        let author = `${$('.disp-bl--bm').text().replace('Created by ', '').trim()}`;
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
        const nextChapterCountdown = (0, utils_1.parseChapterDate)(nextReleaseDate);
        const mangaData = {
            title: title,
            mangaID: mangaID,
            headerImageUrl: headerImageUrl,
            author: author,
            description: description,
            nextChapterCountdown: nextChapterCountdown,
            recommendedManga: recommendedManga,
        };
        return mangaData;
    })
        .catch(error => logger_1.default.info(error));
    return mangaJson;
});
exports.scrapJumpManga = scrapJumpManga;
