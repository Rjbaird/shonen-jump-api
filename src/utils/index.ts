// TODO: Write function documentation
const currentUnixDate = () => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' };
  const todayString = date.toLocaleString('en-US', options);
  const todayUnix = Date.parse(todayString);
  return todayUnix;
};

// COMPLETE
/**
 * Parses chapter numbers to determine if a manga is a One-Shot or not
 *
 * @param recentChapter The most recently released chapter of a manga
 * @return Returns 'Special One-Shot!' if no recent chapters.
 */
const isOneShot = (recentChapter: string) => {
  if (recentChapter == null) {
    return 'Special One-Shot!';
  }
  return recentChapter.toString();
};

// TODO: Write function documentation
const parseChapterDate = (date_string: string) => {
  if (date_string == '' || date_string == null) {
    return 'NA';
  }
  return date_string;
};

// TODO: Write function documentation
const getCompletionStatus = (chapterStatus: string) => {
  if (chapterStatus === 'NA') {
    return true;
  }
  return false;
};

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
const internalError = (error: unknown, msg: string) => {
  const errorMessage = error;
  console.error(msg);
  return {
    data: 'Internal server error... Please try again later or contact dev.',
    error: errorMessage,
  };
};

export { currentUnixDate, isOneShot, parseChapterDate, getCompletionStatus, internalError };
