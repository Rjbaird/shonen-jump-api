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
const manga_list: object[] = [];
const chapterReleases: object[] = [];

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
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' };
  const todayString = date.toLocaleString('en-US', options);
  const todayUnix = Date.parse(todayString);
  return todayUnix;
};

const getAllManga = async () => {
  const url = 'https://www.viz.com/shonenjump';
  axios(url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      let all_manga = $('.o_sortable');
      let chapter_num_regex = /\d+/g;
      all_manga.each((i, e) => {
        let title = $(e).find('img').attr('alt');
        let manga_link = $(e).find('a').attr('href');
        let mangaID = manga_link?.replace('/shonenjump/chapters/', '').trim();
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
};

const getUpcomingReleases = async () => {
  const url = 'https://www.viz.com/shonen-jump-chapter-schedule';
  axios(url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      let table_row = $('tr');
      let chapter_regex: RegExp = /Ch\.\s\d+/g;
      let chapter_num_regex: RegExp = /\d+/g;
      let next_release_regex: RegExp = /\w\w\w,\s\w\w\w\s\d+/g;
      table_row.each((i, e) => {
        let row = $(e).text();
        let title = row.split(',', 1);
        let upcoming_chapter = row.match(chapter_regex);
        let num_of_chapters: any = `${upcoming_chapter}`.match(chapter_num_regex);
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
};

// Update memory on server start
currentUnixDate();
getAllManga();
getUpcomingReleases();

app.get('/', (req: Request, res: Response) => {
  res.send(welcomeMessage);
});

app.get('/all', async (req: Request, res: Response) => {
  res.send(manga_list);
});

app.get('/schedule', async (req: Request, res: Response) => {
  res.send(chapterReleases);
});

app.get('/manga/:mangaID', async (req: Request<{ mangaID: 'string' }>, res: Response) => {
  const { mangaID } = req.params;
  const url = `https://www.viz.com/shonenjump/chapters/${mangaID}`;
  axios(url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      let recommended_manga: object[] = [];
      let title = $('#series-intro').find('h2').text();
      let header_image = $('.o_hero-media').attr('src');
      let author = $('.disp-bl--bm').text().replace('Created by ', '');
      let description = $('h4', '.mar-t-rg').text();
      let next_release_date = $('.section_future_chapter').text().trim();
      $('.o_property-link').each((i, e) => {
        let rec_title = $(e).attr('rel');
        let rec_link = $(e).attr('href');
        let rec_slug = rec_link?.replace('/shonenjump/chapters/', '');
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
});

const parseChapterNumber = (recent_chapter: any) => {
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

app.listen(PORT, (): void => console.log(`Server running at http://localhost:${PORT}`));
