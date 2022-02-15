import logger from '../logger';
import { mangaList, chapterSchedule } from '../db/memory';
import { parseChapterNumber, parseChapterDate } from '../utils';

import axios from 'axios';
import cheerio from 'cheerio';

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
    .catch(error => logger.info(error));
  logger.info('Manga List Updated');
};

const getOneManga = async (mangaId: string) => {
  const url = `https://www.viz.com/shonenjump/chapters/${mangaId}`;
  const mangaJson = axios(url)
    .then(response => {
      const html: string = response.data;
      const $ = cheerio.load(html);
      let recommendedManga: object[] = [];
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
      const nextReleaseCountdown = parseChapterDate(nextReleaseDate);

      const mangaData = {
        title: title,
        headerImageUrl: headerImageUrl,
        author: author,
        description: description,
        nextReleaseCountdown: nextReleaseCountdown,
        recommendedManga: recommendedManga,
      };
      return mangaData;
    })
    .catch(error => logger.info(error));
  return mangaJson;
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
    .catch(error => logger.info(error));
  logger.info('Schedule Updated');
};

const getVizData = async (mangaId: string) => {
  const url = `https://www.viz.com/${mangaId}`;
  const vizJson = axios(url)
    .then(response => {
      const html: string = response.data;
      const $ = cheerio.load(html);
      let recommendedManga: object[] = [];
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
      const nextReleaseCountdown = parseChapterDate(nextReleaseDate);
      const mangaData = {
        title: title,
        headerImageUrl: headerImageUrl,
        author: author,
        description: description,
        nextReleaseCountdown: nextReleaseCountdown,
        recommendedManga: recommendedManga,
      };
      return mangaData;
    })
    .catch(error => logger.info(error));
  return vizJson;
};

export { getUpcomingReleases, getAllManga, getOneManga };
