import logger from '../logger';
import { parseChapterDate } from '../utils';

import axios from 'axios';
import cheerio from 'cheerio';

const scrapJumpManga = async (mangaID: string) => {
  const url = `https://www.viz.com/shonenjump/chapters/${mangaID}`;
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
      const nextChapterCountdown = parseChapterDate(nextReleaseDate);
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
    .catch(error => logger.info(error));
  return mangaJson;
};

export { scrapJumpManga };
