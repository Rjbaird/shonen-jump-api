"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseChapterDate = exports.parseChapterNumber = exports.currentUnixDate = void 0;
const currentUnixDate = () => {
    const date = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' };
    const todayString = date.toLocaleString('en-US', options);
    const todayUnix = Date.parse(todayString);
    return todayUnix;
};
exports.currentUnixDate = currentUnixDate;
const parseChapterNumber = (recent_chapter) => {
    if (recent_chapter == null) {
        return 'Special One-Shot!';
    }
    return recent_chapter.toString();
};
exports.parseChapterNumber = parseChapterNumber;
const parseChapterDate = (date_string) => {
    if (date_string == '' || date_string == null) {
        return 'NA';
    }
    return date_string;
};
exports.parseChapterDate = parseChapterDate;
