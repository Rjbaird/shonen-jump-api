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
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const PORT = process.env.PORT || 8000;
const app = (0, express_1.default)();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many accounts created from this IP, please try again after 15 minutes',
});
// Global Middleware
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(limiter);
// Server Memory
const manga_list = [];
const chapterReleases = [];
const welcomeMessage = {
    title: 'Welcome to the unofficial shonen-jump-api',
    description: 'An API showing data about English translations of Weekly Shonen Jump available on Viz.com',
    repo: 'https://github.com/Rjbaird/shonen-jump-api',
    help: 'https://github.com/Rjbaird/shonen-jump-api/issues',
    RapidAPI: 'https://rapidapi.com/Rjbaird/api/unofficial-shonen-jump',
    endpoints: ['/all', '/schedule', '/manga/:mangaID'],
};
const currentUnixDate = () => {
    const date = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' };
    const todayString = date.toLocaleString('en-US', options);
    const todayUnix = Date.parse(todayString);
    return todayUnix;
};
const getAllManga = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://www.viz.com/shonenjump';
    (0, axios_1.default)(url)
        .then(response => {
        const html = response.data;
        const $ = cheerio_1.default.load(html);
        let all_manga = $('.o_sortable');
        let chapter_num_regex = /\d+/g;
        all_manga.each((i, e) => {
            let title = $(e).find('img').attr('alt');
            let manga_link = $(e).find('a').attr('href');
            let mangaID = manga_link === null || manga_link === void 0 ? void 0 : manga_link.replace('/shonenjump/chapters/', '').trim();
            let newest_chapter_link = $(e).find('.o_inner-link').attr('href');
            let latest_chapter_number = $(e).find('span').first().text().trim().match(chapter_num_regex);
            let latest_chapter_date = $(e).find('.style-italic').first().text().trim();
            const viz = 'https://www.viz.com';
            const chapter_object = {
                title: `${title}`,
                mangaID: `${mangaID}`,
                manga_link: `${viz}${manga_link}`,
                newest_chapter_link: `${viz}${newest_chapter_link}`,
                latest_chapter_date: parseChapterDate(latest_chapter_date),
                latest_chapter_number: parseChapterNumber(latest_chapter_number),
            };
            manga_list[i] = chapter_object;
        });
    })
        .catch(err => console.log(err));
    console.log('Manga List Updated');
});
const getUpcomingReleases = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://www.viz.com/shonen-jump-chapter-schedule';
    (0, axios_1.default)(url)
        .then(response => {
        const html = response.data;
        const $ = cheerio_1.default.load(html);
        let table_row = $('tr');
        let chapter_regex = /Ch\.\s\d+/g;
        let chapter_num_regex = /\d+/g;
        let next_release_regex = /\w\w\w,\s\w\w\w\s\d+/g;
        table_row.each((i, e) => {
            let row = $(e).text();
            let title = row.split(',', 1);
            let upcoming_chapter = row.match(chapter_regex);
            let num_of_chapters = `${upcoming_chapter}`.match(chapter_num_regex);
            let next_chapter_release_date = row.match(next_release_regex);
            let unix_release = Date.parse(`${next_chapter_release_date}`);
            const chapter_object = {
                title: `${title}`,
                chapter_release: parseInt(num_of_chapters),
                upcoming_chapter: `${upcoming_chapter}`,
                release_date: `${next_chapter_release_date}`,
            };
            chapterReleases[i] = chapter_object;
        });
        chapterReleases.shift();
        chapterReleases.pop();
    })
        .catch(err => console.log(err));
    console.log('Schedule Updated');
});
// Update memory on server start
currentUnixDate();
getAllManga();
getUpcomingReleases();
app.get('/', (req, res) => {
    res.send(welcomeMessage);
});
app.get('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(manga_list);
}));
app.get('/schedule', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(chapterReleases);
}));
app.get('/manga/:mangaID', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mangaID } = req.params;
    const url = `https://www.viz.com/shonenjump/chapters/${mangaID}`;
    (0, axios_1.default)(url)
        .then(response => {
        const html = response.data;
        const $ = cheerio_1.default.load(html);
        let recommended_manga = [];
        let title = $('#series-intro').find('h2').text();
        let header_image = $('.o_hero-media').attr('src');
        let author = $('.disp-bl--bm').text().replace('Created by ', '');
        let description = $('h4', '.mar-t-rg').text();
        let next_release_date = $('.section_future_chapter').text().trim();
        $('.o_property-link').each((i, e) => {
            let rec_title = $(e).attr('rel');
            let rec_link = $(e).attr('href');
            let rec_slug = rec_link === null || rec_link === void 0 ? void 0 : rec_link.replace('/shonenjump/chapters/', '');
            let recommendation_obj = {
                title: rec_title,
                title_slug: rec_slug,
                link: `https://www.viz.com${rec_link}`,
            };
            recommended_manga[i] = recommendation_obj;
        });
        recommended_manga.join(', ');
        const manga_object = {
            title: `${title}`,
            header_image: `${header_image}`,
            author: `${author}`,
            description: `${description}`,
            next_release_countdown: parseChapterDate(next_release_date),
            recommended_manga: recommended_manga,
        };
        res.send(manga_object);
    })
        .catch(err => console.log(err));
}));
const parseChapterNumber = (recent_chapter) => {
    if (recent_chapter == null) {
        return 'Special One-Shot!';
    }
    return recent_chapter.toString();
};
const parseChapterDate = (date_string) => {
    if (date_string == '' || date_string == null) {
        return 'NA';
    }
    return date_string;
};
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
