import logger from '../logger';
import axios, { AxiosError } from 'axios';
import cheerio from 'cheerio';
import { Manga } from '../models/manga.model';
import {
  recommendedMangaObj,
  jumpMangaObj,
  recommendedVizObj,
  vizMangaObj,
  completeMangaObj,
  mangaListObj,
} from '../interfaces';

// ========== SECTION: Manga Scraping Services ========== //

// COMPLETE
/**
 * Scrape Shonen Jump for all available manga
 * @return Returns an array of mangaListObj with  manga titles and mangaIDs
 */
export const scrapeMangaList = async () => {
  let mangaList: mangaListObj[] = [];
  const jump = 'https://www.viz.com/shonenjump';
  const response = await axios(jump);
  const html = response.data;
  const $ = cheerio.load(html);
  let allManga = $('.o_sortable');
  allManga.each((i, e) => {
    let title = `${$(e).find('.type-rg--sm').text().trim()}`;
    let mangaLink = `${$(e).find('a').attr('href')}`;
    let mangaID = mangaLink.replace('/shonenjump/chapters/', '').trim();
    const mangaObject: mangaListObj = {
      title: title,
      mangaID: mangaID,
    };
    mangaList.push(mangaObject);
  });
  logger.info('Manga List Scraped');
  return mangaList;
};

// COMPLETE
/**
 * Scrape Shonen Jump for details on a manga
 * @param mangaID String id or titleSlug for a manga on Shonen Jump/Viz
 * @return Returns a jumpMangaObj with details on a manga from viz.com/shonenjump
 */
export const scrapeJumpMangaData = async (mangaID: string) => {
  const url = `https://www.viz.com/shonenjump/chapters/${mangaID}`;
  try {
    const response = await axios(url);
    const html = response.data;
    const $ = cheerio.load(html);
    let recommendedManga: recommendedMangaObj[] = [];
    let headerImg = `${$('.o_hero-media').attr('src')}`;
    let thumbnailImg = `${$('img', '.shift').attr('src')}`;
    let title = $('h2', '.mar-t-rg').text();
    let description = $('h4', '.mar-t-rg').text();
    let authorInfo = $('.disp-bl--bm').text();
    let ratedMature = false;
    if ($('.o_m-rated ').text()) {
      ratedMature = true;
    }
    $('.o_property-link').each((i, e) => {
      let recommendedTitle = `${$(e).attr('rel')}`;
      let recommendedLink = `${$(e).attr('href')}`;
      let recommendedSlug = recommendedLink.replace('/shonenjump/chapters/', '');
      let recommendedMangaObj = {
        title: recommendedTitle,
        titleSlug: recommendedSlug,
        link: `https://www.viz.com${recommendedLink}`,
      };
      recommendedManga[i] = recommendedMangaObj;
    });
    const mangaObject: jumpMangaObj = {
      title,
      mangaID,
      jumpLink: url,
      headerImg,
      thumbnailImg,
      description,
      authorInfo,
      ratedMature,
      recommendedManga,
    };
    return mangaObject;
  } catch (error) {
    logger.info(error);
  }
};

// COMPLETE
/**
 * Scrape Viz for details on a manga
 * @param mangaID String id or titleSlug for a manga on Shonen Jump/Viz
 * @return Returns a vizMangaObj with details on a manga from viz.com/
 */
export const scrapeVizMangaData = async (mangaID: string) => {
  const url = `https://www.viz.com/${mangaID}`;
  try {
    const response = await axios(url);
    if (response.status == 404) {
      const mangaObject: vizMangaObj = {
        title: '',
        mangaID,
        vizLink: 'NA',
        headerImg: 'NA',
        thumbnailImg: 'NA',
        description: 'NA',
        authorInfo: 'NA',
        recommendedManga: [],
      };
      return mangaObject;
    }
    const html = response.data;
    const $ = cheerio.load(html);
    let recommendedManga: recommendedVizObj[] = [];
    let headerImg = `${$('.o_hero-media').attr('src')}`;
    let thumbnailImg = `${$('img', '.shift').attr('src')}`;
    let title = $('#page_title').text();
    let description = $('p', '#series-intro-jump').text();
    let authorText = $('.disp-bl--bm').text();
    let authorInfo = authorText.split('MoreLess')[0].trim();
    $('.o_property-link').each((i, e) => {
      let recommendedTitle = `${$(e).attr('rel')}`;
      let recommendedLink = `${$(e).attr('href')}`;
      let recommendedSlug = recommendedLink.replace('/shonenjump/chapters/', '');
      let recommendedVizObj = {
        title: recommendedTitle,
        titleSlug: recommendedSlug,
        link: `https://www.viz.com${recommendedLink}`,
      };
      recommendedManga[i] = recommendedVizObj;
    });
    const mangaObject: vizMangaObj = {
      title,
      mangaID,
      vizLink: url,
      headerImg,
      thumbnailImg,
      description,
      authorInfo,
      recommendedManga,
    };
    return mangaObject;
  } catch (error) {
    if (error.message === 'Request failed with status code 404') {
      const mangaObject: vizMangaObj = {
        title: '',
        mangaID,
        vizLink: 'NA',
        headerImg: 'NA',
        thumbnailImg: 'NA',
        description: 'NA',
        authorInfo: 'NA',
        recommendedManga: [],
      };
      return mangaObject;
    }
    logger.info(error);
  }
};

// ========== SECTION Data Manipulation ========== //

// COMPLETE
/**
 * Combine data from scrapeJumpMangaData and scrapeVizMangaData functions
 *
 * @param jumpData A jumpMangaObj with details on a manga from viz.com/shonenjump
 * @param vizData A vizMangaObj with details on a manga from viz.com/
 * @return Returns a completeMangaObj with details on a manga from both viz.com and viz.com/shonenjump
 */
export const combineMangaData = (jumpData: jumpMangaObj, vizData: vizMangaObj) => {
  const completeManga: completeMangaObj = {
    title: jumpData.title,
    mangaID: jumpData.mangaID,
    jumpLink: jumpData.jumpLink,
    vizLink: vizData.vizLink || 'NA',
    jumpImages: [jumpData.headerImg, jumpData.thumbnailImg],
    vizImages: [vizData.headerImg, vizData.thumbnailImg],
    authorInfo: jumpData.authorInfo || vizData.authorInfo,
    ratedMature: jumpData.ratedMature,
    descriptionJump: jumpData.description,
    descriptionViz: vizData.description,
  };
  return completeManga;
};

// COMPLETE
/**
 * Combine data from getJumpMangaData and getVizMangaData functions
 *
 * @param mangaID The number to raise.
 * @return Adds a completeMangaObj with details on a manga from both viz.com and viz.com/shonenjump
 */
export const createCompleteManga = async (mangaID: string) => {
  try {
    const jumpData = scrapeJumpMangaData(mangaID);
    const vizData = scrapeVizMangaData(mangaID);
    const scrapedData = await Promise.all([jumpData, vizData]);
    const completeManga = combineMangaData(scrapedData[0] as jumpMangaObj, scrapedData[1] as vizMangaObj);
    return completeManga;
  } catch (error) {
    logger.error(error, `Error creating completeMangaObj for ${mangaID}...`);
    return false;
  }
};

// ========== SECTION Database Handling & Validation ========== //

// COMPLETE
/**
 * Creates a Manga document in the database based on a completeMangaObj
 *
 * @param completeMangaObj Data used to create a Manga document in the database
 * @return Returns the Manga document added to the database
 */
export const createManga = async (completeMangaObj: completeMangaObj) => {
  try {
    let results = await Manga.create({
      ...completeMangaObj,
    });
    return results;
  } catch (error) {
    logger.error(error, `Error adding ${completeMangaObj.title} to database...`);
    return false;
  }
};

// COMPLETE
/**
 * Finds a Manga document in the database based on a mangaID
 *
 * @param mangaID String id or titleSlug for a manga on Shonen Jump/Viz
 * @return Returns a Manga document from the database
 */
export const findManga = async (mangaID: string) => {
  try {
    return await Manga.findOne({ mangaID: mangaID }, { _id: 0 }).select('-__v');
  } catch (error) {
    logger.error(error, `Error finding ${mangaID} in database...`);
    return false;
  }
};

// COMPLETE
/**
 * Replaces a Manga document in the database based on a mangaID and a completeMangaObj
 *
 * @param mangaID String id or titleSlug for a manga on Shonen Jump/Viz
 * @param completeMangaObj Replacement data for a Manga document
 * @return Returns the replacement Manga document
 */
export const updateManga = async (mangaID: string, completeMangaObj: completeMangaObj) => {
  try {
    if (completeMangaObj.mangaID !== mangaID) {
      logger.error(`mangaIDs did not match...`);
      return false;
    }
    return await Manga.findOneAndReplace({ mangaID: mangaID }, { ...completeMangaObj });
  } catch (error) {
    logger.error(error, `Error updating ${mangaID} in database...`);
    return false;
  }
};
