import logger from "../logger";
import axios from "axios";
import cheerio from "cheerio";
import { Schedule } from "../models/schedule.model";

// ========== SECTION: Database Services ========== //
// COMPLETE
/**
 * Clear schedule collection in database
 * @return Returns true if database is cleared, false otherwise
 */
export const clearScheduleDB = async () => {
  try {
    await Schedule.collection.drop();
    logger.info("Schedule collection cleared");
    return true;
  } catch (error) {
    logger.error(error, "Error clearing schedule collection...");
    return false;
  }
};

// COMPLETE
/**
 * Sends updated schedule to MongoDB
 * @params List of upcoming release objects
 * @return Returns true if database is updated, false otherwise
 */
export const updateScheduleDB = async (scheduleArray: object[]) => {
  try {
    await Schedule.insertMany(scheduleArray);
    return true;
  } catch (error) {
    logger.error(error, "Error adding schedule collection...");
    return false;
  }
};

// ========== SECTION: Scraping Services ========== //

// COMPLETE
/**
 * Scrape & parse chapter schedule page for upcoming releases and push into an object array
 *
 * @param  date UNIX date of the current day. Used to filter out past releases.
 * @return List of upcoming chapter objects
 */
export const getUpcomingReleases = async (date: number) => {
  // Set empty array for chapterSchedule objects
  let chapterSchedule: object[] = [];
  const url: string = "https://www.viz.com/shonen-jump-chapter-schedule";

  // Set RegExps for parsing
  const chapterRegex: RegExp = /Ch\.\s\d+/g;
  const chapterNumberRegex: RegExp = /\d+/g;
  const nextReleaseRegex: RegExp = /\w\w\w,\s\w\w\w\s\d+/g;

  // Set date string options
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  };

  try {
    const response = await axios(url);
    const html = response.data;
    const $ = cheerio.load(html);
    let table_row = $("tr");
    table_row.each((i, e) => {
      let row = $(e).text();
      let title = `${row.split(",", 1)}`;
      let upcomingChapter = `${row.match(chapterRegex)}`;
      let numOfChapters = parseInt(
        `${`${upcomingChapter}`.match(chapterNumberRegex)}`
      );
      let nextChapterReleaseDate = `${row.match(nextReleaseRegex)}`;

      let unixReleaseDate = Date.parse(nextChapterReleaseDate);

      const chapterObject = {
        title: title,
        chapterRelease: numOfChapters,
        upcomingChapter: upcomingChapter,
        releaseDateString: nextChapterReleaseDate,
        unixReleaseDate: unixReleaseDate,
      };

      if (unixReleaseDate >= date) {
        return chapterSchedule.push(chapterObject);
      }
    });
  } catch (error) {
    logger.error(error);
  }

  chapterSchedule.shift(); // Remove table headers
  logger.info("Schedule scraped!");
  return chapterSchedule;
};
