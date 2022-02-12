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

export { currentUnixDate, parseChapterNumber, parseChapterDate };