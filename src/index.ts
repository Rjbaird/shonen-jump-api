import express, { Request, Response } from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const PORT = process.env.PORT || 8000;
const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many accounts created from this IP, please try again after 15 minutes',
});

// Global Middleware
app.use(express.json());
app.use(helmet());
app.use(limiter);

// Server Memory
let mangaList: object[] = [];
let chapterSchedule: object[] = [];

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
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' };
  const todayString = date.toLocaleString('en-US', options);
  const todayUnix = Date.parse(todayString);
  return todayUnix;
};

const parseChapterNumber = (recent_chapter: RegExpMatchArray | null) => {
  if (recent_chapter == null) {
    return 'Special One-Shot!';
  }
  return recent_chapter.toString();
};

const parseChapterDate = (date_string: string) => {
  if (date_string == '' || date_string == null) {
    return 'NA';
  }
  return date_string;
};

// Data Collection Functions
const getAllManga = async () => {
  const url = 'https://www.viz.com/shonenjump';
  axios(url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      let allManga = $('.o_sortable');
      let chapterNumberRegex = /\d+/g;
      allManga.each((i, e) => {
        let title = `${$(e).find('img').attr('alt')}`;
        let mangaLink = `${$(e).find('a').attr('href')}`;
        let mangaID = mangaLink.replace('/shonenjump/chapters/', '').trim();
        let newestChapterLink = `${$(e).find('.o_inner-link').attr('href')}`;
        let latestChapterNumber: RegExpMatchArray | null = $(e)
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
};

const getUpcomingReleases = async (date: number) => {
  const url = 'https://www.viz.com/shonen-jump-chapter-schedule';
  axios(url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      let table_row = $('tr');
      let chapterRegex: RegExp = /Ch\.\s\d+/g;
      let chapterNumberRegex: RegExp = /\d+/g;
      let nextReleaseRegex: RegExp = /\w\w\w,\s\w\w\w\s\d+/g;
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
};

// Update memory on server start
const today = currentUnixDate();
getAllManga();
getUpcomingReleases(today);

// API Routes
app.get('/', (req: Request, res: Response) => {
  res.send(welcomeMessage);
});

app.get('/all', async (req: Request, res: Response) => {
  res.send(mangaList);
});

app.get('/schedule', async (req: Request, res: Response) => {
  res.send(chapterSchedule);
});

app.get('/manga/:mangaID', async (req: Request<{ mangaID: 'string' }>, res: Response) => {
  const { mangaID } = req.params;
  const url = `https://www.viz.com/shonenjump/chapters/${mangaID}`;
  axios(url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      let recommendedManga: object[] = [];
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
});

app.listen(PORT, (): void => console.log(`Server running at http://localhost:${PORT}`));
