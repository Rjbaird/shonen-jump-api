"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalError = exports.getCompletionStatus = exports.parseChapterDate = exports.isOneShot = exports.currentUnixDate = void 0;
// TODO: Write function documentation
const currentUnixDate = () => {
    const date = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' };
    const todayString = date.toLocaleString('en-US', options);
    const todayUnix = Date.parse(todayString);
    return todayUnix;
};
exports.currentUnixDate = currentUnixDate;
// COMPLETE
/**
 * Parses chapter numbers to determine if a manga is a One-Shot or not
 *
 * @param recentChapter The most recently released chapter of a manga
 * @return Returns 'Special One-Shot!' if no recent chapters.
 */
const isOneShot = (recentChapter) => {
    if (recentChapter == null) {
        return 'Special One-Shot!';
    }
    return recentChapter.toString();
};
exports.isOneShot = isOneShot;
// TODO: Write function documentation
const parseChapterDate = (date_string) => {
    if (date_string == '' || date_string == null) {
        return 'NA';
    }
    return date_string;
};
exports.parseChapterDate = parseChapterDate;
// TODO: Write function documentation
const getCompletionStatus = (chapterStatus) => {
    if (chapterStatus === 'NA') {
        return true;
    }
    return false;
};
exports.getCompletionStatus = getCompletionStatus;
// COMPLETE
/**
 * Used on all 500 responses
 *
 * Creates an error object and logs a developer message based on where the error originates.
 *
 * @param error The full error from a catch
 * @param msg The message to log in the console for bug catches
 * @return Returns an object with a generic 'Internal Error' message plus the catch error to send to the user.
 */
const internalError = (error, msg) => {
    const errorMessage = error;
    console.error(msg);
    return {
        data: 'Internal server error... Please try again later or contact dev.',
        error: errorMessage,
    };
};
exports.internalError = internalError;
