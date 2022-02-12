// Server Memory
let mangaList: object[] = [];
let chapterSchedule: object[] = [];
const welcomeMessage = {
  title: 'Welcome to the unofficial shonen-jump-api',
  description: 'An API showing data about English translations of Weekly Shonen Jump available on Viz.com',
  repo: 'https://github.com/Rjbaird/shonen-jump-api',
  help: 'https://github.com/Rjbaird/shonen-jump-api/issues',
  rapidAPI: 'https://rapidapi.com/Rjbaird/api/unofficial-shonen-jump',
  endpoints: ['/manga', '/manga/:mangaID', '/schedule']
};
export { mangaList, chapterSchedule, welcomeMessage };
