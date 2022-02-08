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
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
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
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)());
app.use(limiter);
// Server Memory
let mangaList = [];
let chapterSchedule = [];
// Welcome Message
const welcomeMessage = {
    title: 'Welcome to the unofficial shonen-jump-api',
    description: 'An API showing data about English translations of Weekly Shonen Jump available on Viz.com',
    repo: 'https://github.com/Rjbaird/shonen-jump-api',
    help: 'https://github.com/Rjbaird/shonen-jump-api/issues',
    RapidAPI: 'https://rapidapi.com/Rjbaird/api/unofficial-shonen-jump',
    endpoints: ['/all', '/schedule', '/manga/:mangaID'],
};
// Utility Functions
const currentUnixDate = () => {
    const date = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' };
    const todayString = date.toLocaleString('en-US', options);
    const todayUnix = Date.parse(todayString);
    return todayUnix;
};
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
                latestChapterDate: parseChapterDate(latestChapterDate),
                latestChapterNumber: parseChapterNumber(latestChapterNumber),
            };
            mangaList.push(chapterObject);
        });
    })
        .catch(err => console.log(err));
    console.log('Manga List Updated');
});
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
                return chapterSchedule.push(chapterObject);
            }
        });
        chapterSchedule.shift(); // Remove table headers
        // chapterSchedule.pop(); // Remove table footer
    })
        .catch(err => console.log(err));
    console.log('Schedule Updated');
});
// Update memory on server start
const today = currentUnixDate();
getAllManga();
getUpcomingReleases(today);
// API Routes
app.get('/', (req, res) => {
    try {
        res.send(welcomeMessage);
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
app.get('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send(mangaList);
    }
    catch (error) {
        return res.status(500).send(error);
    }
}));
app.get('/schedule', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send(chapterSchedule);
    }
    catch (error) {
        return res.status(500).send(error);
    }
}));
app.get('/manga/:mangaID', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mangaID } = req.params;
        const url = `https://www.viz.com/shonenjump/chapters/${mangaID}`;
        (0, axios_1.default)(url)
            .then(response => {
            const html = response.data;
            const $ = cheerio_1.default.load(html);
            let recommendedManga = [];
            let title = $('#series-intro').find('h2').text();
            let headerImageUrl = `${$('.o_hero-media').attr('src')}`;
            let author = $('.disp-bl--bm').text().replace('Created by ', '');
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
            const mangaObject = {
                title: `${title}`,
                headerImageUrl: `${headerImageUrl}`,
                author: `${author}`,
                description: `${description}`,
                nextReleaseCountdown: parseChapterDate(nextReleaseDate),
                recommendedManga: recommendedManga,
            };
            res.send(mangaObject);
        })
            .catch(err => console.log(err));
    }
    catch (error) {
        return res.status(500).send(error);
    }
}));
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
