export const getWelcomMessage = () => {
  return {
    title: 'Welcome to the unofficial shonen-jump-api',
    description: 'A REST API showing data about English translations of Weekly Shonen Jump available on Viz.com',
    repo: 'https://github.com/Rjbaird/shonen-jump-api',
    help: 'https://github.com/Rjbaird/shonen-jump-api/issues',
    endpoints: ['/v1/manga', '/v1/manga/:mangaID', '/v1/schedule'],
  };
};
